"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDuplicateDocumentMutation,
  useDeleteDocumentMutation,
} from "@/lib/queries/documents";

type DocumentCardProps = {
  id: string;
  title: string;
  customer: string;
  issueDate: string;
  status?: "DRAFT" | "FINALIZED" | string;
  grandTotal?: string;
};

export function DocumentCard({
  id,
  title,
  customer,
  issueDate,
  status,
  grandTotal,
}: DocumentCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setIsLoading] = useState(false);

  const duplicateMutation = useDuplicateDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();

  const handleDuplicate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    duplicateMutation.mutate(id, {
      onSuccess: (data) => {
        toast.success(`Duplicated "${title}" successfully`);
        router.push(`/dashboard/documents/${data.id}`);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to duplicate document",
        );
      },
      onSettled: () => setIsLoading(false),
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setIsLoading(true);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Deleted "${title}"`);
        setDeleteDialogOpen(false);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete document",
        );
      },
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <>
      <div className="relative group flex w-40 shrink-0 flex-col overflow-hidden rounded-xl border transition-all hover:ring-primary/40 hover:shadow-md bg-card">
        <Link
          href={`/dashboard/documents/${id}`}
          className="flex flex-col w-full h-full"
        >
          <div className="relative flex h-48 items-center justify-center bg-muted/40 transition-colors group-hover:bg-primary/5">
            <Button
              size="icon-xs"
              variant="secondary"
              onClick={handleDuplicate}
              disabled={duplicateMutation.isPending || loading}
              title="Duplicate document"
              className="absolute top-2 left-2 z-10 hidden group-hover:flex transition-all"
            >
              {duplicateMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>

            {status === "DRAFT" && (
              <Button
                size="icon-xs"
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={deleteMutation.isPending || loading}
                title="Delete document"
                className="absolute top-2 left-9 z-10 hidden group-hover:flex transition-all"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </Button>
            )}

            {status && (
              <Badge
                variant={status === "FINALIZED" ? "default" : "outline"}
                className={cn(
                  "absolute top-2 right-2 text-[10px] px-1.5 py-0 font-semibold tracking-wide pointer-events-none",
                  status === "FINALIZED"
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "bg-background/90 text-muted-foreground border-border",
                )}
              >
                {status === "FINALIZED" ? "Finalized" : "Draft"}
              </Badge>
            )}

            <FileText className="size-10 text-muted-foreground/40 transition-colors group-hover:text-primary/40" />
          </div>

          <div className="flex flex-col gap-0.5 border-t px-3 py-2.5">
            <p className="text-sm font-medium truncate">{title}</p>
            <p className="text-xs text-muted-foreground truncate">{customer}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">
                {formatDate(issueDate)}
              </span>
              {grandTotal && (
                <span className="text-[10px] font-semibold">
                  {formatCurrency(grandTotal)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{title}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="flex w-40 shrink-0 flex-col overflow-hidden rounded-xl border">
      <div className="flex h-48 items-center justify-center bg-muted/40">
        <Skeleton className="size-10 rounded-lg" />
      </div>
      <div className="flex flex-col gap-1.5 border-t px-3 py-2.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-2.5 w-16 mt-1" />
      </div>
    </div>
  );
}
