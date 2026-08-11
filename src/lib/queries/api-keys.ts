import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/client";

export const apiKeyQueryKeys = {
  all: ["api-keys"] as const,
  lists: () => [...apiKeyQueryKeys.all, "list"] as const,
};

export function useApiKeysQuery() {
  return useQuery({
    queryKey: apiKeyQueryKeys.lists(),
    queryFn: async () => {
      const res = await authClient.apiKey.list();
      if (res.error) {
        throw new Error(res.error.message || "Failed to fetch API keys");
      }
      return res.data?.apiKeys ?? [];
    },
  });
}

export function useCreateApiKeyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name?: string }) => {
      const res = await authClient.apiKey.create({ name });
      if (res.error) {
        throw new Error(res.error.message || "Failed to create API key");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() });
    },
  });
}

export function useDeleteApiKeyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const res = await authClient.apiKey.delete({ keyId });
      if (res.error) {
        throw new Error(res.error.message || "Failed to delete API key");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() });
    },
  });
}
