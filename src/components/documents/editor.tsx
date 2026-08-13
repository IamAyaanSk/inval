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
    <div className="flex flex-col gap-6 rounded-2xl bg-card pr-6 md:pr-8 text-card-foreground">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-base font-semibold">Document Editor</h2>
          <p className="text-xs text-muted-foreground">
            Edit metadata and line items in real time
          </p>
        </div>
        <Button
          type="button"
          onClick={handleFinalize}
          disabled={finalizeMutation.isPending}
          className="gap-2 rounded-2xl"
        >
          {finalizeMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Finalize Document
        </Button>
      </div>

      <DocumentMetaEditor
        documentId={document.id}
        documentMeta={{
          title: document.title,
          customer: document.customer,
          issueDate: document.issueDate,
        }}
        setEditorHasError={setEditorHasError}
      />

      <div className="flex flex-col gap-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Line Items ({document.lineItems.length})
          </h3>
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
          <div className="flex flex-col gap-4 bg-muted py-4 px-2 rounded-2xl overflow-x-auto">
            <div className="min-w-[620px] flex flex-col gap-4">
              <div className="grid grid-cols-8 text-sm gap-2 font-medium px-4 text-muted-foreground">
                <h5 className="col-span-3">Description</h5>
                <h5>Unit Price</h5>
                <h5>Quantity</h5>
                <h5 className="col-span-2">Discount</h5>
                <h5>Tax (%)</h5>
              </div>
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

              <div className="flex items-center justify-center">
                <Button
                  size={"lg"}
                  onClick={handleAddLineItem}
                  disabled={createLineItemMutation.isPending}
                  className="text-xs w-fit rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                >
                  {createLineItemMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 pt-6 border-t text-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
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
