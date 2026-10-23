import { NextRequest, NextResponse } from "next/server";
import { createAdminAccount } from "@/app/features/admin/services/admin-auth.service";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, confirmPassword } = await request.json();

    // Validation
    if (!email || !name || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 },
      );
    }

    const result = await createAdminAccount(email, name, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      );
    }

    // Set JWT cookie
    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        admin: result.admin,
      },
      { status: 201 },
    );

    response.cookies.set("admin_token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Admin signup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
