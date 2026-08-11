"use client";

import { useDocumentsQuery } from "@/lib/queries/documents";
import {
  DocumentCard,
  DocumentCardSkeleton,
} from "@/components/documents/card";
import { NewDocumentDialog } from "@/components/documents/new-document-dialog";
import { ErrorAlert } from "@/components/error-alert";

export function DocumentsContent() {
  const { data, isLoading, isError, error } = useDocumentsQuery();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Documents</h2>
          <p className="text-lg text-secondary-foreground/40 font-semibold tracking-tight -mt-1">
            All your documents
          </p>
        </div>
      </div>

      {isError && (
        <ErrorAlert error={error} fallbackMessage="Failed to load documents" />
      )}

      <div className="flex flex-col gap-8 px-2">
        <div className="flex flex-wrap gap-4">
          <NewDocumentDialog />

          {isLoading || !data ? (
            <>
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
            </>
          ) : (
            data.documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                customer={doc.customer}
                issueDate={doc.issueDate}
                status={doc.status}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
