"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCustomer } from "@/app/features/customer/actions/create-customer";

export default function NewRetailerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    const result = await createCustomer({
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
    });

    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/dashboard/retailers");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-7 sm:px-8">
      <div>
        <p className="text-sm font-medium text-[#667085]">Retailers</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#172033]">
          Add retailer
        </h1>
        <p className="mt-1 text-sm text-[#667085]">
          Create an account to track payments and receivables.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-xl border border-[#e4e7ec] bg-white p-5"
      >
        {[
          ["name", "Name", "Retailer or business name", "text"],
          ["email", "Email", "billing@example.com", "email"],
          ["phone", "Phone", "98XXXXXXXX", "tel"],
        ].map(([name, label, placeholder, type]) => (
          <label key={name} className="block">
            <span className="text-sm font-medium text-[#344054]">{label}</span>
            <input
              required
              name={name}
              type={type}
              placeholder={placeholder}
              className="mt-2 block w-full rounded-lg border border-[#d0d5dd] px-3 py-2.5 text-sm outline-none focus:border-[#243b64] focus:ring-2 focus:ring-[#eef2fa]"
            />
          </label>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#243b64] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save retailer"}
          </button>
        </div>
      </form>
    </div>
  );
}
