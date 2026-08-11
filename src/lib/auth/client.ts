import { createAuthClient } from "better-auth/react";
import { apiKeyClient } from "@better-auth/api-key/client";

export const authClient = createAuthClient({
  plugins: [apiKeyClient()],
  baseURL: process.env.BETTER_AUTH_URL,
});
