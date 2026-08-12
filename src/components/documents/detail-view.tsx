"use client";

import { useState } from "react";
import Link from "next/link";
import { useDocumentDetailQuery } from "@/lib/queries/documents";
import { DocumentPreview } from "@/components/documents/preview";
import { DocumentEditor } from "@/components/documents/editor";
import { ErrorAlert } from "@/components/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export function DocumentDetailView({ documentId }: { documentId: string }) {
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

  const {
    data: document,
    isLoading,
    isError,
    error,
  } = useDocumentDetailQuery(documentId);

  const isFinalized = document?.status === "FINALIZED";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/documents" />}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Documents
        </Button>

        {document && (
          <div className="flex items-center gap-2.5 pr-6 md:pr-8">
            {document.status === "DRAFT" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowPreviewMobile((prev) => !prev)}
                className="md:hidden text-xs h-7 px-2.5"
              >
                {showPreviewMobile ? "Hide Preview" : "Show Preview"}
              </Button>
            )}

            {isFinalized && (
              <Button
                type="button"
                size="sm"
                onClick={() => window.print()}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <Printer className="size-3.5" /> Print
              </Button>
            )}

            <Badge
              variant={isFinalized ? "default" : "outline"}
              className={cn(
                "text-[10px] px-2.5 py-0.5 font-semibold tracking-wide uppercase",
                isFinalized
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border",
              )}
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 lg:col-span-5 flex flex-col gap-4 rounded-2xl border p-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-64 w-full mt-4" />
          </div>
          <div className="md:col-span-7 lg:col-span-7 flex flex-col gap-4 rounded-2xl border p-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
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
    </div>
  );
}
