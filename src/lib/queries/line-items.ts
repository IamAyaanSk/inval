import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";
import { documentQueryKeys } from "@/lib/queries/documents";
import type {
  CreateLineItemRequestBody,
  CreateLineItemApiResponse,
  UpdateLineItemRequestBody,
  UpdateLineItemApiResponse,
  DeleteLineItemApiResponse,
} from "@/lib/validations/line-items";
import {
  createLineItemApiResponseSchema,
  updateLineItemApiResponseSchema,
  deleteLineItemApiResponseSchema,
} from "@/lib/validations/line-items";
import type { GetDocumentByIdApiResponse } from "@/lib/validations/documents";

async function createLineItem(
  documentId: string,
  body: CreateLineItemRequestBody,
) {
  const data = await apiFetch<CreateLineItemApiResponse>(
    `/api/documents/${documentId}/line-items`,
    {
      method: "POST",
      body,
    },
  );

  const parsed = createLineItemApiResponseSchema.parse(data);
  return parsed.data;
}

async function updateLineItem(
  documentId: string,
  lineItemId: string,
  body: UpdateLineItemRequestBody,
) {
  const data = await apiFetch<UpdateLineItemApiResponse>(
    `/api/documents/${documentId}/line-items/${lineItemId}`,
    {
      method: "PUT",
      body,
    },
  );

  const parsed = updateLineItemApiResponseSchema.parse(data);
  return parsed.data;
}

async function deleteLineItem(documentId: string, lineItemId: string) {
  const data = await apiFetch<DeleteLineItemApiResponse>(
    `/api/documents/${documentId}/line-items/${lineItemId}`,
    {
      method: "DELETE",
    },
  );

  const parsed = deleteLineItemApiResponseSchema.parse(data);
  return parsed.data;
}

type DocumentDetailData = GetDocumentByIdApiResponse["data"];

export function useCreateLineItemMutation(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateLineItemRequestBody) =>
      createLineItem(documentId, body),
    onSuccess: (data) => {
      queryClient.setQueryData<DocumentDetailData>(
        documentQueryKeys.detail(documentId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            lineItems: [...old.lineItems, data.lineItem],
            ...data.documentTotals,
          };
        },
      );
    },
  });
}

export function useUpdateLineItemMutation(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lineItemId,
      body,
    }: {
      lineItemId: string;
      body: UpdateLineItemRequestBody;
    }) => updateLineItem(documentId, lineItemId, body),
    onSuccess: (data) => {
      queryClient.setQueryData<DocumentDetailData>(
        documentQueryKeys.detail(documentId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            lineItems: old.lineItems.map((item) =>
              item.id === data.lineItem.id ? data.lineItem : item,
            ),
            ...data.documentTotals,
          };
        },
      );
    },
  });
}

export function useDeleteLineItemMutation(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lineItemId: string) => deleteLineItem(documentId, lineItemId),
    onSuccess: (data) => {
      queryClient.setQueryData<DocumentDetailData>(
        documentQueryKeys.detail(documentId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            lineItems: old.lineItems.filter(
              (item) => item.id !== data.lineItemId,
            ),
            ...data.documentTotals,
          };
        },
      );
    },
  });
}
