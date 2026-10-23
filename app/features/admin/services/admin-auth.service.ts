"use server";

import { db } from "@/lib/db/client";
import { adminUsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.NEXTAUTH_SECRET || (() => {
  throw new Error("NEXTAUTH_SECRET is required");
})();

export type AdminUser = typeof adminUsersTable.$inferSelect;
export type AdminLoginResponse = { success: boolean; message: string; admin?: AdminUser; token?: string };

export async function findAdminByEmail(email: string) {
  const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email.trim().toLowerCase())).limit(1);
  return admin || null;
}

export async function findAdminById(id: string) {
  const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, id)).limit(1);
  return admin || null;
}

export async function createAdminAccount(email: string, name: string, password: string): Promise<AdminLoginResponse> {
  if (await findAdminByEmail(email)) return { success: false, message: "Admin account with this email already exists" };
  const [admin] = await db.insert(adminUsersTable).values({ email: email.trim().toLowerCase(), name: name.trim(), passwordHash: await bcrypt.hash(password, 12), isActive: true }).returning();
  const token = jwt.sign({ id: admin.id, email: admin.email, isAdmin: true }, JWT_SECRET, { expiresIn: "30d" });
  return { success: true, message: "Admin account created successfully", admin, token };
}

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResponse> {
  const admin = await findAdminByEmail(email);
  if (!admin || !admin.isActive || !(await bcrypt.compare(password, admin.passwordHash))) return { success: false, message: "Invalid email or password" };
  const token = jwt.sign({ id: admin.id, email: admin.email, isAdmin: true }, JWT_SECRET, { expiresIn: "30d" });
  return { success: true, message: "Login successful", admin, token };
}