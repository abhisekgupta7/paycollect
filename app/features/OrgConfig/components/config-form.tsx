"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, CloudUpload, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/Utility/ImageUploader";
import {
  organizationConfigSchema,
  type OrganizationConfigInput,
} from "../types/config.types";
import { getOrganizationConfigAction } from "../actions/get-config";
import { createOrganizationConfigAction } from "../actions/create-config";
import { updateOrganizationConfigAction } from "../actions/update-config";

export default function OrgConfigForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [existingConfig, setExistingConfig] =
    useState<OrganizationConfigInput | null>(null);
  const [isEditingQr, setIsEditingQr] = useState(false);
  const [isUpdatingQr, setIsUpdatingQr] = useState(false);

  const form = useForm<OrganizationConfigInput>({
    resolver: zodResolver(organizationConfigSchema),
    defaultValues: {
      paymentMethod: "MANUAL",
      qrCodeUrl: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        setIsLoading(true);
        const result = await getOrganizationConfigAction();
        if (result.success && result.data) {
          const loadedConfig: OrganizationConfigInput = {
            paymentMethod:
              result.data.paymentMethod === "ESEWA" ? "ESEWA" : "MANUAL",
            qrCodeUrl: result.data.qrCodeUrl || "",
            phoneNumber: result.data.phoneNumber || "",
          };

          setExistingConfig(loadedConfig);
          form.reset(loadedConfig);
        }
      } catch {
        toast.error("Failed to load organization config");
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, [form]);

  const onSubmit = async (data: OrganizationConfigInput) => {
    const result = await createOrganizationConfigAction(data);
    if (!result.success) {
      toast.error(result.message || "Failed to save config");
      return;
    }

    toast.success(result.message || "Config saved successfully");
    setExistingConfig({
      paymentMethod: data.paymentMethod,
      qrCodeUrl: data.qrCodeUrl || "",
      phoneNumber: data.phoneNumber || "",
    });
  };

  const handleUploadComplete = (url: string) => {
    form.setValue("qrCodeUrl", url, { shouldValidate: true });
    toast.success("QR code uploaded successfully");
  };

  const handleUploadError = () => {
    toast.error("Failed to upload QR code");
  };

  const handleStartEditQr = () => setIsEditingQr(true);

  const handleCancelEditQr = () => setIsEditingQr(false);

  const handleExistingQrUploadComplete = async (url: string) => {
    if (!existingConfig) return;

    try {
      setIsUpdatingQr(true);
      const result = await updateOrganizationConfigAction({
        paymentMethod: existingConfig.paymentMethod,
        qrCodeUrl: url,
        phoneNumber: existingConfig.phoneNumber || "",
      });

      if (!result.success) {
        toast.error(result.message || "Failed to update QR code");
        return;
      }

      toast.success(result.message || "QR code updated successfully");
      setExistingConfig({ ...existingConfig, qrCodeUrl: url });
      setIsEditingQr(false);
    } catch {
      toast.error("Failed to update QR code");
    } finally {
      setIsUpdatingQr(false);
    }
  };

  const handleExistingQrUploadError = () => {
    toast.error("Failed to upload QR code");
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-muted-foreground">
        Loading organization config...
      </div>
    );
  }

  if (existingConfig) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0f141b] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Organization config
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              Payment setup
            </h2>
            <p className="text-sm text-muted-foreground">
              This organization already has a saved payment config.
            </p>
          </div>
          <Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" />
            Configured
          </Badge>
        </div>

        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <span>Payment method</span>
            <span className="font-medium text-foreground">
              {existingConfig.paymentMethod}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>QR code URL</span>
            <div className="flex max-w-full items-center gap-3">
              <span className="max-w-56 truncate font-medium text-foreground">
                {existingConfig.qrCodeUrl || "Not set"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartEditQr}
                className="border-white/10 bg-white/5 text-foreground hover:bg-white/10"
              >
                Edit QR
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Phone number</span>
            <span className="font-medium text-foreground">
              {existingConfig.phoneNumber || "Not set"}
            </span>
          </div>
        </div>

        {isEditingQr && (
          <div className="mt-4 space-y-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Replace QR code
              </p>
              <p className="text-sm text-muted-foreground">
                Upload a new QR image or paste one to update the organization
                payment config.
              </p>
            </div>

            <ImageUploader
              onUploadComplete={handleExistingQrUploadComplete}
              onError={handleExistingQrUploadError}
              folder="/org-config"
              label="Upload new QR code"
              allowPaste
            />

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleCancelEditQr}
                variant="outline"
                className="border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                disabled={isUpdatingQr}
              >
                Cancel
              </Button>
              <div className="flex-1 text-sm text-muted-foreground">
                The QR config updates as soon as the upload finishes.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0f141b] p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Organization config
        </p>
        <h2 className="text-2xl font-semibold text-foreground">
          Payment setup
        </h2>
        <p className="text-sm text-muted-foreground">
          Keep only the payment method, QR code URL, and phone number in this
          configuration.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment method</Label>
          <select
            id="paymentMethod"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none transition focus:border-emerald-400/50"
            {...form.register("paymentMethod")}
          >
            <option value="MANUAL">MANUAL</option>
            <option value="ESEWA">ESEWA</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Choose how customers will pay for this organization.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qrCodeUrl">QR code URL</Label>
          <Input
            id="qrCodeUrl"
            placeholder="https://..."
            className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground"
            {...form.register("qrCodeUrl")}
          />
          {form.formState.errors.qrCodeUrl && (
            <p className="text-xs text-red-400">
              {form.formState.errors.qrCodeUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <CloudUpload className="h-4 w-4" />
            QR upload helper
          </div>
          <ImageUploader
            onUploadComplete={handleUploadComplete}
            onError={handleUploadError}
            folder="/org-config"
            label="Upload or paste QR code"
            allowPaste
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone number</Label>
          <Input
            id="phoneNumber"
            placeholder="Enter support or payment phone number"
            className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground"
            inputMode="tel"
            {...form.register("phoneNumber")}
          />
          <p className="text-xs text-muted-foreground">
            This is the phone number shown with the organization payment
            details.
          </p>
          {form.formState.errors.phoneNumber && (
            <p className="text-xs text-red-400">
              {form.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4" />
            Saved fields only: payment method, QR code URL, phone number.
          </div>
        </div>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-11 w-full bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
        >
          {form.formState.isSubmitting ? "Saving..." : "Save config"}
        </Button>
      </form>
    </div>
  );
}
