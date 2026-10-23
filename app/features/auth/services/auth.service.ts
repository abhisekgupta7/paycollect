"use server";

import { db } from "@/lib/db/client";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface CreateUserInput {
  email: string;
  name: string;
  password?: string;
  image?: string;
}

export interface UserWithPassword {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  return user[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  return user[0] || null;
}

/**
 * Create new user (for email/password signup)
 */
export async function createUser(input: CreateUserInput) {
  const { email, name, password, image } = input;

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password if provided
  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const result = await db
    .insert(usersTable)
    .values({
      email,
      name,
      passwordHash,
      image,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
}

/**
 * Verify password
 */
export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string,
) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password");
  }

  const isValid = await verifyPassword(user.passwordHash, password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  return user;
}
