"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onError: () => void;
  folder?: string; // e.g., "/products", "/merchant/123/products", "/heroSection/images"
  label?: string;
  allowPaste?: boolean;
}

const ImageUploader = ({
  onUploadComplete,
  onError,
  folder = "/PaymentProofs", // Default folder if not provided
  label = "Product Image",
  allowPaste = false,
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const authenticator = async () => {
    try {
      const response = await fetch("/api/imagekit-auth");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`,
        );
      }

      const data = await response.json();
      const { signature, expire, token, publicKey } = data;
      return { signature, expire, token, publicKey };
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Authentication request failed");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description:
          "Please upload a valid image file (JPEG, PNG, WebP, or GIF)",
      });
      e.target.value = "";
      onError();
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 5MB",
      });
      e.target.value = ""; // Reset the file input
      onError();
      return;
    }

    // Show success toast and automatically start upload
    toast.success("File selected", {
      description: `${file.name} is ready to upload`,
    });

    handleUpload(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!allowPaste) {
      return;
    }

    const clipboardItems = Array.from(e.clipboardData.items);
    const imageItem = clipboardItems.find((item) =>
      item.type.startsWith("image/"),
    );

    if (!imageItem) {
      return;
    }

    const file = imageItem.getAsFile();
    if (!file) {
      return;
    }

    e.preventDefault();
    toast.success("Screenshot pasted", {
      description: `${file.name || "clipboard image"} is ready to upload`,
    });
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    setUploadedUrl("");

    // Create a new AbortController for this upload
    abortControllerRef.current = new AbortController();

    try {
      // Show uploading toast
      toast.loading("Uploading image...", { id: "upload-toast" });

      // Retrieve authentication parameters
      const authParams = await authenticator();
      const { signature, expire, token, publicKey } = authParams;

      // Upload the file
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        folder, // Use the folder prop passed from parent

        abortSignal: abortControllerRef.current.signal,
      });

      // Success - get the URL from response
      const imageUrl = (uploadResponse as { url?: string }).url;
      if (!imageUrl) {
        throw new Error("Upload response did not include an image URL");
      }
      setUploadedUrl(imageUrl);

      toast.success("Image uploaded successfully!", { id: "upload-toast" });

      // Call the onUploadComplete callback with the URL
      onUploadComplete(imageUrl);

      // Clear the file input after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      // Handle specific error types
      if (error instanceof ImageKitAbortError) {
        toast.error("Upload cancelled", { id: "upload-toast" });
      } else if (error instanceof ImageKitInvalidRequestError) {
        toast.error("Invalid request", {
          description: error.message,
          id: "upload-toast",
        });
      } else if (error instanceof ImageKitUploadNetworkError) {
        toast.error("Network error", {
          description: "Please check your connection and try again",
          id: "upload-toast",
        });
      } else if (error instanceof ImageKitServerError) {
        toast.error("Server error", {
          description: error.message,
          id: "upload-toast",
        });
      } else {
        toast.error("Upload failed", {
          description: "An unexpected error occurred",
          id: "upload-toast",
        });
      }

      console.error("Upload error:", error);
      onError();

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div
      className="space-y-3"
      onPaste={allowPaste ? handlePaste : undefined}
      tabIndex={allowPaste ? 0 : -1}
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="product-image"
          className="text-emerald-900 font-semibold"
        >
          {label}
        </label>
        {allowPaste && (
          <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800 outline-none focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            Click here and paste your screenshot, or use the file picker below.
          </div>
        )}
        <Input
          id="product-image"
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
      </div>

      {uploadedUrl && !isUploading && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Image
            src={uploadedUrl}
            alt="Uploaded preview"
            width={64}
            height={64}
            className="h-16 w-16 rounded-md object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-900">
              Image uploaded
            </p>
            <p className="text-xs text-emerald-600 truncate">{uploadedUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
