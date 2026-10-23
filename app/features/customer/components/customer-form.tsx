"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCustomerSchema,
  type CreateCustomerInput,
} from "../types/customer.types";
import { createCustomer } from "../actions/create-customer";

export default function CustomerForm() {
  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: CreateCustomerInput) => {
    const result = await createCustomer(data);
    if (!result.success) {
      toast.error(result.message || "Failed to create customer");
      return;
    }

    toast.success("Customer created successfully");
    form.reset();
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border border-border shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <div className="inline-flex w-fit items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customers
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Create customer
            </h2>
            <p className="text-sm text-muted-foreground">
              Add a customer record with contact details.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-foreground">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                className="h-9"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Customer Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                className="h-9"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Customer Phone (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-foreground">
                Phone (optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter 10-digit phone number"
                className="h-9"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating..." : "Create Customer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
