import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";
import { nextCookies } from "better-auth/next-js";
import { apiKey } from "@better-auth/api-key";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log("Verification URL:", url, token, user);
    },
  },
  plugins: [
    nextCookies(),
    apiKey({
      enableSessionForAPIKeys: true,
    }),
  ],
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
});
