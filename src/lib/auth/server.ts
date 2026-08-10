import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
