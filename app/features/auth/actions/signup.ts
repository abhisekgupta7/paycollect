"use server";

import { createUser } from "../services/auth.service";
import { createOrganizationWithMembership } from "../services/membership.service";

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface SignupResult {
  success: boolean;
  message: string;
  userId?: string;
  organizationId?: string;
}

/**
 * Signup flow: Create User → Create Organization → Create Membership
 */
export async function signup(input: SignupInput): Promise<SignupResult> {
  try {
    // Validate input
    if (!input.email || !input.name || !input.password) {
      return {
        success: false,
        message: "Email, name, and password are required",
      };
    }

    // Step 1: Create user
    const user = await createUser({
      email: input.email,
      name: input.name,
      password: input.password,
    });

    // Step 2: Create organization and membership
    const { organization } = await createOrganizationWithMembership(
      user.id,
      `${user.name}'s Business`,
      "OWNER",
    );

    return {
      success: true,
      message: "Signup successful",
      userId: user.id,
      organizationId: organization.id,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message === "User already exists"
        ? error.message
        : "Unable to create your account right now. Please try again.";
    console.error("Signup failed:", error);
    return {
      success: false,
      message,
    };
  }
}
