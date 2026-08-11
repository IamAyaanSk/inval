"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { DEFAULT_LINE_ITEM } from "@/lib/constants";
import type { GetDocumentByIdApiResponse } from "@/lib/validations/documents";
import { useFinalizeDocumentMutation } from "@/lib/queries/documents";
import { useCreateLineItemMutation } from "@/lib/queries/line-items";
import { DocumentMetaEditor } from "@/components/documents/meta-editor";
import { LineItemEditor } from "@/components/line-items/editor";

type DocumentData = GetDocumentByIdApiResponse["data"];

export function DocumentEditor({ document }: { document: DocumentData }) {
  const [editorHasError, setEditorHasError] = useState(false);

  const finalizeMutation = useFinalizeDocumentMutation();
  const createLineItemMutation = useCreateLineItemMutation(document.id);

  function handleAddLineItem() {
    createLineItemMutation.mutate(DEFAULT_LINE_ITEM, {
      onSuccess: () => toast.success("Line item added"),
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : "Failed to add line item",
        ),
    });
  }

  function handleFinalize() {
    if (editorHasError) {
      toast.error("Please fix all form errors before finalizing");
      return;
    }

    finalizeMutation.mutate(document.id, {
      onSuccess: () => toast.success("Document finalized successfully!"),
      onError: (error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to finalize document",
        ),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Editor Header */}
      <div className="flex items-center justify-between rounded-2xl border bg-card p-4 md:px-6 shadow-xs text-card-foreground">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold">Document Editor</h2>
        </div>
        <Button
          type="button"
          onClick={handleFinalize}
          disabled={finalizeMutation.isPending}
          className="gap-2"
        >
          {finalizeMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Finalize Document
        </Button>
      </div>

      {/* Metadata Editor */}
      <DocumentMetaEditor
        documentId={document.id}
        documentMeta={{
          title: document.title,
          customer: document.customer,
          issueDate: document.issueDate,
        }}
        setEditorHasError={setEditorHasError}
      />

      {/* Line Items Editor */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 md:p-8 shadow-xs text-card-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Line Items</h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {document.lineItems.length}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddLineItem}
            disabled={createLineItemMutation.isPending}
            className="gap-1.5 text-xs"
          >
            {createLineItemMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            Add Item
          </Button>
        </div>

        {document.lineItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
            <p className="text-xs text-muted-foreground">
              No line items in this document.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddLineItem}
              disabled={createLineItemMutation.isPending}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" /> Add First Item
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {document.lineItems.map((item) => (
              <LineItemEditor
                key={item.id}
                documentId={document.id}
                item={item}
                setEditorHasError={setEditorHasError}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals Summary */}
      <div className="flex flex-col gap-2.5 rounded-2xl border bg-card p-6 md:p-8 shadow-xs text-card-foreground text-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Document Totals
        </h3>
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">
            {formatCurrency(document.subTotal)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Discount</span>
          <span className="font-medium text-foreground">
            -{formatCurrency(document.discountAmount)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span className="font-medium text-foreground">
            +{formatCurrency(document.taxAmount)}
          </span>
        </div>
        <div className="flex justify-between items-center border-t pt-3 mt-1">
          <span className="text-sm font-semibold">Grand Total</span>
          <span className="text-base font-bold text-primary">
            {formatCurrency(document.grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
