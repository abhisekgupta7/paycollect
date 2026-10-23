import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .min(1, "Phone number is required"),
});

export const createCustomerSchema = customerSchema;

export const updateCustomerSchema = customerSchema.partial().extend({
  id: z.string().uuid("Customer id is required"),
});

export type CustomerSchema = z.infer<typeof customerSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
