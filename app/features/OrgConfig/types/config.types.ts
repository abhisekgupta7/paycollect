import { z } from "zod";

const optionalUrl = z.union([
  z.string().url("QR code must be a valid URL"),
  z.literal(""),
]);

const optionalText = z.union([
  z.string().max(25, "Phone number must be 25 characters or less"),
  z.literal(""),
]);

export const organizationConfigSchema = z.object({
  paymentMethod: z.enum(["MANUAL", "ESEWA"]),
  qrCodeUrl: optionalUrl.optional(),
  phoneNumber: optionalText.optional(),
});

export const createOrganizationConfigSchema = organizationConfigSchema;

export const updateOrganizationConfigSchema = organizationConfigSchema;

export type OrganizationConfigInput = z.infer<typeof organizationConfigSchema>;
export type CreateOrganizationConfigInput = z.infer<
  typeof createOrganizationConfigSchema
>;
export type UpdateOrganizationConfigInput = z.infer<
  typeof updateOrganizationConfigSchema
>;
