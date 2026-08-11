"use client";

import Link from "next/link";
import { useDocumentDetailQuery } from "@/lib/queries/documents";
import { DocumentPreview } from "@/components/documents/preview";
import { DocumentEditor } from "@/components/documents/editor";
import { ErrorAlert } from "@/components/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function DocumentDetailView({ documentId }: { documentId: string }) {
  const {
    data: document,
    isLoading,
    isError,
    error,
  } = useDocumentDetailQuery(documentId);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/documents" />}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Documents
        </Button>
      </div>

      {isError && (
        <ErrorAlert error={error} fallbackMessage="Failed to load document" />
      )}

      {isLoading || !document ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4 rounded-2xl border p-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-64 w-full mt-4" />
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border p-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : document.status === "DRAFT" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-4">
            <DocumentPreview document={document} />
          </div>
          <div>
            <DocumentEditor document={document} />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          <DocumentPreview document={document} />
        </div>
      )}
    </div>
  );
}
