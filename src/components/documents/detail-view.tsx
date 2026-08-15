"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useDocumentDetailQuery,
  useDuplicateDocumentMutation,
  useDeleteDocumentMutation,
} from "@/lib/queries/documents";
import { DocumentPreview } from "@/components/documents/preview";
import { DocumentEditor } from "@/components/documents/editor";
import { ErrorAlert } from "@/components/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Copy, Loader2, Printer, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function DocumentDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      <div className="hidden md:flex md:col-span-5 flex-col rounded-2xl border bg-card overflow-hidden shadow-xs">
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-3.5 w-20 rounded-md" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </div>

          <div className="rounded-xl border overflow-hidden mt-1 flex flex-col divide-y divide-border/40">
            <Skeleton className="h-9 w-full bg-muted/60" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="flex flex-col items-end gap-2 pt-1">
            <Skeleton className="h-3.5 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-48 rounded-md" />
          </div>
        </div>

        <div className="h-20 bg-primary/20 p-6 flex items-center justify-between mt-auto">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28 bg-primary-foreground/30" />
            <Skeleton className="h-3 w-36 bg-primary-foreground/20" />
          </div>
          <Skeleton className="h-8 w-32 bg-primary-foreground/40" />
        </div>
      </div>

      <div className="md:col-span-7 flex flex-col gap-6 rounded-2xl border bg-card p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Skeleton className="sm:col-span-2 h-9 w-full rounded-lg" />
            <Skeleton className="sm:col-span-1 h-9 w-full rounded-lg" />
            <Skeleton className="sm:col-span-1 h-9 w-full rounded-lg" />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t">
          <Skeleton className="h-4 w-28 rounded-md" />
          <div className="flex flex-col gap-3 bg-muted/40 p-3 rounded-2xl">
            <Skeleton className="h-10 w-full rounded-xl bg-background/80" />
            <Skeleton className="h-10 w-full rounded-xl bg-background/80" />
            <Skeleton className="h-10 w-full rounded-xl bg-background/80" />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 border-t">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-5 w-full rounded-md mt-2" />
        </div>
      </div>
    </div>
  );
}

export function DocumentDetailView({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: document,
    isLoading,
    isError,
    error,
  } = useDocumentDetailQuery(documentId);

  const duplicateMutation = useDuplicateDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();

  const isFinalized = document?.status === "FINALIZED";

  const handleDuplicate = () => {
    if (!document) return;
    duplicateMutation.mutate(document.id, {
      onSuccess: (data) => {
        toast.success("Document duplicated successfully");
        router.push(`/dashboard/documents/${data.id}`);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to duplicate document",
        );
      },
    });
  };

  const handleDeleteDocument = () => {
    if (!document) return;
    deleteMutation.mutate(document.id, {
      onSuccess: () => {
        toast.success("Document deleted successfully");
        setDeleteDialogOpen(false);
        router.push("/dashboard/documents");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete document",
        );
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/documents" />}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 sm:px-3 h-8"
        >
          <ArrowLeft className="size-4 shrink-0" />
          <span className="hidden sm:inline">Back to Documents</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {document && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {document.status === "DRAFT" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowPreviewMobile((prev) => !prev)}
                className="md:hidden"
              >
                {showPreviewMobile ? "Hide Preview" : "Show Preview"}
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDuplicate}
              disabled={duplicateMutation.isPending}
              title="Duplicate Document"
            >
              {duplicateMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span className="hidden sm:inline">Duplicate</span>
            </Button>

            {!isFinalized && (
              <Button
                type="button"
                size="sm"
                variant={"destructive"}
                onClick={() => setDeleteDialogOpen(true)}
                title="Delete Document"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}

            {isFinalized && (
              <Button
                type="button"
                size="sm"
                onClick={() => window.print()}
                title="Print Document"
                className="text-xs h-8 px-2.5 gap-1.5"
              >
                <Printer className="size-3.5" />
                <span className="hidden sm:inline">Print</span>
              </Button>
            )}

            <Badge
              variant={isFinalized ? "default" : "outline"}
              className="text-[10px] px-2 py-0.5 font-semibold tracking-wide uppercase h-6"
            >
              {isFinalized ? "Finalized" : "Draft"}
            </Badge>
          </div>
        )}
      </div>

      {isError && (
        <ErrorAlert error={error} fallbackMessage="Failed to load document" />
      )}

      {isLoading || !document ? (
        <DocumentDetailSkeleton />
      ) : document.status === "DRAFT" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-8 items-start">
          <div
            className={cn(
              "md:sticky md:top-4 md:col-span-5 lg:col-span-5 transition-all duration-300",
              showPreviewMobile ? "block" : "hidden md:block",
            )}
          >
            <DocumentPreview document={document} />
          </div>
          <div className="md:col-span-7 lg:col-span-7">
            <DocumentEditor document={document} />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          <DocumentPreview document={document} />
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {document?.title || "this document"}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
