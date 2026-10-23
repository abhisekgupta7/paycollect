import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import "@/app/features/auth/types/auth.types";
import { loginWithEmailPassword } from "@/app/features/auth/actions/login";
import {
  findUserByEmail,
  createUser,
} from "@/app/features/auth/services/auth.service";
import {
  getActiveOrgForUser,
  createOrganizationWithMembership,
} from "@/app/features/auth/services/membership.service";
import type { Account, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

/**
 * Helper function to fetch and enrich user with organization data
 */
async function enrichUserWithOrg(userEmail: string) {
  try {
    const userRecord = await findUserByEmail(userEmail);
    if (userRecord) {
      let activeOrg;
      try {
        activeOrg = await getActiveOrgForUser(userRecord.id);
      } catch (error) {
        // Backfill older users that exist without an organization membership.
        if (
          error instanceof Error &&
          error.message === "No organization found for user"
        ) {
          await createOrganizationWithMembership(
            userRecord.id,
            `${userRecord.name || "Business"}'s Business`,
            "OWNER",
          );
          activeOrg = await getActiveOrgForUser(userRecord.id);
        } else {
          throw error;
        }
      }

      return {
        activeOrgId: activeOrg.organizationId,
        role: activeOrg.role as "OWNER" | "ADMIN" | "MEMBER",
      };
    }
  } catch (error) {
    console.error("Error fetching org:", error);
  }
  return null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),

    // Email/Password Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password required");
        }

        const result = await loginWithEmailPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (!result.success) {
          throw new Error(result.message);
        }

        return {
          id: result.user!.id,
          email: result.user!.email,
          name: result.user!.name,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      // Auto-create user for Google OAuth if doesn't exist
      if (account?.provider === "google") {
        try {
          const existingUser = await findUserByEmail(user.email!);

          if (!existingUser) {
            // Create new user from Google profile
            const newUser = await createUser({
              email: user.email!,
              name: user.name || "",
              image: user.image || undefined,
              // No password for OAuth users
            });

            // Create organization and membership for new Google user
            await createOrganizationWithMembership(
              newUser.id,
              `${newUser.name}'s Business`,
              "OWNER",
            );

            // Update user object with new ID for downstream callbacks
            user.id = newUser.id;
          } else {
            // User exists, update user object with stored ID
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Error in Google signIn callback:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      // On initial sign in, populate token with user data
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name || "";
        token.image = user.image || undefined;

        // Fetch organization data for both credentials and OAuth users
        const orgData = await enrichUserWithOrg(user.email!);
        if (orgData) {
          token.activeOrgId = orgData.activeOrgId;
          token.role = orgData.role;
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.activeOrgId = (token.activeOrgId as string) || undefined;
        session.user.role =
          (token.role as "OWNER" | "ADMIN" | "MEMBER") || undefined;
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/signup",
  },

  secret: process.env.NEXTAUTH_SECRET!,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
