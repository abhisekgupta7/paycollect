"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  QrCode,
  ShieldCheck,
  UploadCloud,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { getOrganizationConfigPublic } from "@/app/features/OrgConfig/actions/get-config-public";
import { getCustomerByPhonePublic } from "@/app/features/customer/actions/get-customer-by-phone-public";
import { submitPaymentPublic } from "@/app/features/billing/actions/submit-payment-public";
import ImageUploader from "@/components/Utility/ImageUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type OrgConfig = {
  id: string;
  organizationId: string;
  paymentMethod: string;
  qrCodeUrl: string | null;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
};

type VerifiedCustomer = {
  id: string;
  name: string;
  phone: string | null;
};

export default function PublicPaymentPage() {
  const params = useParams();
  const organizationId = params?.organizationId as string;

  const [config, setConfig] = useState<OrgConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const [proofUrl, setProofUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verifiedCustomer, setVerifiedCustomer] =
    useState<VerifiedCustomer | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);

  const normalizePhone = (value: string) => value.replace(/\D/g, "").slice(-10);
  const parseAmountToPaisa = (value: string) => {
    const numericAmount = Number.parseFloat(value);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return null;
    return Math.round(numericAmount * 100);
  };

  // Load organization config on mount
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoadingConfig(true);
      const result = await getOrganizationConfigPublic(organizationId);

      if (result.success && result.data) {
        setConfig(result.data as OrgConfig);
        setConfigError(null);
      } else {
        setConfigError(
          result.message || "Unable to load payment configuration",
        );
        setConfig(null);
      }

      setIsLoadingConfig(false);
    };

    if (organizationId) {
      loadConfig();
    }
  }, [organizationId]);

  const handleUploadComplete = (url: string) => {
    setProofUrl(url);
    toast.success("Payment proof uploaded successfully");
  };

  const handleUploadError = () => {
    toast.error("Failed to upload proof image");
  };

  const handleVerifyPhone = async () => {
    const normalizedPhone = normalizePhone(phoneNumber);

    if (normalizedPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!proofUrl) {
      toast.error("Please upload or paste your payment screenshot first");
      return;
    }

    const amountInPaisa = parseAmountToPaisa(amount);
    if (!amountInPaisa) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsLookingUp(true);
    try {
      const result = await getCustomerByPhonePublic(
        organizationId,
        normalizedPhone,
      );

      if (!result.success || !result.customer) {
        toast.error(
          result.message ||
            "Please enter your correct number for payment verification.",
        );
        setIsLookingUp(false);
        return;
      }

      setVerifiedCustomer(result.customer);
      setIsDialogOpen(true);
    } catch {
      toast.error("Error verifying phone number");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!verifiedCustomer) return;

    const amountInPaisa = parseAmountToPaisa(amount);
    if (!amountInPaisa) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPaymentPublic(
        organizationId,
        proofUrl,
        verifiedCustomer.id,
        phoneNumber,
        amountInPaisa,
      );

      if (result.success) {
        setSubmitSuccess(true);
        setSuccessPaymentId(result.paymentId || null);
        toast.success(result.message);
        //notification addition can be handled here if needed

        // Reset form after 2 seconds
        setTimeout(() => {
          setProofUrl("");
          setPhoneNumber("");
          setAmount("");
          setVerifiedCustomer(null);
          setIsDialogOpen(false);
          setSubmitSuccess(false);
        }, 2000);
      } else {
        toast.error(result.message || "Failed to submit payment");
      }
    } catch {
      toast.error("Error submitting payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <QrCode className="w-12 h-12 text-slate-400" />
          </div>
          <p className="text-slate-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (configError || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-red-200 bg-red-50">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-red-900">
            Payment Unavailable
          </h1>
          <p className="text-red-700">{configError}</p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Success state
  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-green-200 bg-green-50">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-green-900">
            Payment Submitted!
          </h1>
          <p className="text-green-700">
            Your payment proof has been submitted successfully. The seller will
            verify it shortly.
          </p>
          {successPaymentId && (
            <p className="text-sm text-green-600 font-mono bg-white/50 p-2 rounded">
              Reference: {successPaymentId}
            </p>
          )}
          <p className="text-xs text-green-600">
            Redirecting to payment details...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Make Payment</h1>
          <p className="text-slate-600 mt-2">
            Submit your payment proof for verification
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Instructions (Compact) */}
          <Card className="lg:col-span-2 overflow-hidden border-0 shadow-lg">
            <div className="bg-linear-to-br from-blue-500 to-blue-600 p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-sm font-bold">Payment Details</h2>
              </div>

              <div className="space-y-3">
                {/* Payment Method */}
                {config.paymentMethod && (
                  <div>
                    <p className="text-xs text-blue-100 mb-1">Method</p>
                    <p className="text-sm font-semibold truncate">
                      {config.paymentMethod}
                    </p>
                  </div>
                )}

                {/* QR Code */}
                {config.qrCodeUrl && (
                  <div className="bg-white/10 backdrop-blur p-3 rounded-lg">
                    <p className="text-xs text-blue-100 mb-2">Scan QR</p>
                    <div className="bg-white p-4 rounded w-full flex items-center justify-center">
                      <Image
                        src={config.qrCodeUrl}
                        alt="Payment QR Code"
                        width={260}
                        height={260}
                        className="h-auto w-full max-w-196"
                      />
                    </div>
                  </div>
                )}

                {/* Contact Phone */}
                {config.phoneNumber && (
                  <div className="border-t border-white/20 pt-3">
                    <p className="text-xs text-blue-100 mb-1">Contact</p>
                    <a
                      href={`tel:${config.phoneNumber}`}
                      className="text-sm font-semibold hover:text-blue-100 transition"
                    >
                      {config.phoneNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Right: Payment Form (2 cols on lg) */}
          <Card className="lg:col-span-1 border-0 shadow-lg p-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-500" />
                  Upload Proof
                </div>
              </h3>
              <p className="text-xs text-slate-600">
                Screenshot of payment confirmation
              </p>
            </div>

            {/* Image Uploader */}
            <div className="max-w-md">
              <ImageUploader
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
              />
            </div>

            {proofUrl && (
              <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border-2 border-green-200">
                <Image
                  src={proofUrl}
                  alt="Payment Proof Preview"
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-green-500 text-xs">
                  Uploaded ✓
                </Badge>
              </div>
            )}

            {/* Amount and Phone Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Amount (NPR)
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLookingUp || isSubmitting}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="10-digit number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLookingUp || isSubmitting}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerifyPhone}
              disabled={
                !proofUrl ||
                !phoneNumber ||
                !amount ||
                isLookingUp ||
                isSubmitting
              }
              className="w-full"
              size="sm"
            >
              {isLookingUp ? "Verifying..." : "Verify & Submit"}
            </Button>

            {/* Verification Dialog */}
            {isDialogOpen && verifiedCustomer && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="max-w-sm w-full border-0 shadow-2xl">
                  <div className="p-6 space-y-6">
                    <div className="text-center space-y-2">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                      <h3 className="text-lg font-bold text-slate-900">
                        Confirm Customer Details
                      </h3>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Name
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {verifiedCustomer.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {verifiedCustomer.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Amount
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          NPR{" "}
                          {Number.parseFloat(amount || "0").toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setVerifiedCustomer(null);
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleConfirmSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </Card>
        </div>

        {/* Help Footer */}
        <div className="mt-8 text-center text-xs text-slate-600">
          <p className="mb-1">Need help? Contact seller</p>
          {config.phoneNumber && (
            <a
              href={`tel:${config.phoneNumber}`}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {config.phoneNumber}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
