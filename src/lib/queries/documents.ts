import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";
import type {
  CreateDocumentApiRequestBody,
  DocumentSummaryQueryParams,
  GetDocumentByIdApiResponse,
  ListDocumentsApiResponse,
  DocumentSummaryApiResponse,
  UpdateDocumentMetaApiRequestBody,
} from "@/lib/validations/documents";
import {
  createDocumentApiResponseSchema,
  documentSummaryApiResponseSchema,
  getDocumentByIdApiResponseSchema,
  listDocumentsApiResponseSchema,
  updateDocumentMetaApiResponseSchema,
} from "@/lib/validations/documents";

export const documentQueryKeys = {
  all: ["documents"] as const,
  lists: () => [...documentQueryKeys.all, "list"] as const,
  detail: (documentId: string) =>
    [...documentQueryKeys.all, "detail", documentId] as const,
  summaries: () => [...documentQueryKeys.all, "summary"] as const,
  summary: (params: DocumentSummaryQueryParams) =>
    [...documentQueryKeys.summaries(), params] as const,
} as const;

export async function fetchDocuments(opts?: { signal?: AbortSignal }) {
  const data = await apiFetch<ListDocumentsApiResponse>("/api/documents", {
    method: "GET",
    signal: opts?.signal,
  });

  const parsed = listDocumentsApiResponseSchema.parse(data);
  return parsed.data;
}

export async function fetchDocumentById(
  documentId: string,
  opts?: { signal?: AbortSignal },
) {
  const data = await apiFetch<GetDocumentByIdApiResponse>(
    `/api/documents/${documentId}`,
    {
      method: "GET",
      signal: opts?.signal,
    },
  );

  const parsed = getDocumentByIdApiResponseSchema.parse(data);
  return parsed.data;
}

export async function fetchDocumentSummary(
  params: DocumentSummaryQueryParams,
  opts?: { signal?: AbortSignal },
) {
  const url = new URL(window.location.origin + "/api/documents/summary");
  url.searchParams.set("from", params.from);
  url.searchParams.set("to", params.to);

  const data = await apiFetch<DocumentSummaryApiResponse>(
    url.pathname + url.search,
    {
      method: "GET",
      signal: opts?.signal,
    },
  );

  const parsed = documentSummaryApiResponseSchema.parse(data);
  return parsed.data;
}

async function createDocument(body: CreateDocumentApiRequestBody) {
  const data = await apiFetch("/api/documents", {
    method: "POST",
    body,
  });

  const parsed = createDocumentApiResponseSchema.parse(data);
  return parsed.data;
}

async function updateDocumentMeta(
  documentId: string,
  body: UpdateDocumentMetaApiRequestBody,
) {
  const data = await apiFetch(`/api/documents/${documentId}`, {
    method: "PUT",
    body,
  });

  const parsed = updateDocumentMetaApiResponseSchema.parse(data);
  return parsed.data;
}

async function deleteDocument(documentId: string) {
  await apiFetch(`/api/documents/${documentId}`, {
    method: "DELETE",
  });
}

async function finalizeDocument(documentId: string) {
  await apiFetch(`/api/documents/${documentId}/finalize`, {
    method: "PUT",
  });
}

export function useDocumentsQuery() {
  return useQuery({
    queryKey: documentQueryKeys.lists(),
    queryFn: ({ signal }) => fetchDocuments({ signal }),
  });
}

export function useDocumentDetailQuery(documentId: string) {
  return useQuery({
    queryKey: documentQueryKeys.detail(documentId),
    queryFn: ({ signal }) => fetchDocumentById(documentId, { signal }),
  });
}

export function useDocumentSummaryQuery(params: DocumentSummaryQueryParams) {
  return useQuery({
    queryKey: documentQueryKeys.summary(params),
    queryFn: ({ signal }) => fetchDocumentSummary(params, { signal }),
    placeholderData: keepPreviousData,
  });
}

type DocumentDetailData = GetDocumentByIdApiResponse["data"];

export function useCreateDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateDocumentApiRequestBody) => createDocument(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: documentQueryKeys.lists(),
      });
    },
  });
}

export function useUpdateDocumentMetaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      body,
    }: {
      documentId: string;
      body: UpdateDocumentMetaApiRequestBody;
    }) => updateDocumentMeta(documentId, body),
    onSuccess: async (data) => {
      queryClient.setQueryData<DocumentDetailData>(
        documentQueryKeys.detail(data.id),
        (old) => {
          if (!old) return old;
          return { ...old, ...data };
        },
      );

      await queryClient.invalidateQueries({
        queryKey: documentQueryKeys.lists(),
      });
    },
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: documentQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: documentQueryKeys.summaries(),
        }),
      ]);
    },
  });
}

export function useFinalizeDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => finalizeDocument(documentId),
    onSuccess: async (_data, documentId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: documentQueryKeys.detail(documentId),
        }),
        queryClient.invalidateQueries({
          queryKey: documentQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: documentQueryKeys.summaries(),
        }),
      ]);
    },
  });
}
