"use server";

import { authenticateUser } from "../services/auth.service";
import { getActiveOrgForUser } from "../services/membership.service";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  activeOrg?: {
    organizationId: string;
    role: string;
  };
}

/**
 * Login flow: Verify password → Fetch memberships → Set active org
 */
export async function loginWithEmailPassword(
  input: LoginInput,
): Promise<LoginResult> {
  try {
    // Validate input
    if (!input.email || !input.password) {
      return {
        success: false,
        message: "Email and password are required",
      };
    }

    // Step 1: Authenticate user
    const user = await authenticateUser(input.email, input.password);

    // Step 2: Get user's memberships and active organization
    const activeOrg = await getActiveOrgForUser(user.id);

    if (!activeOrg) {
      return {
        success: false,
        message: "No organization found for user",
      };
    }

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      activeOrg: {
        organizationId: activeOrg.organizationId,
        role: activeOrg.role,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error &&
      (error.message === "Invalid email or password" ||
        error.message === "No organization found for user")
        ? error.message
        : "Unable to sign in right now. Please try again.";
    console.error("Login failed:", error);
    return {
      success: false,
      message,
    };
  }
}
