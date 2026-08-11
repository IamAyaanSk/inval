"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDocumentSummaryQuery } from "@/lib/queries/documents";
import {
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components/dashboard/summary-card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { InfoIcon } from "lucide-react";
import {
  dateStringToIsoEndOfDay,
  dateStringToIsoStartOfDay,
  formatCurrency,
  formatDate,
  getDefaultDateRangeStrings,
} from "@/lib/utils";
import {
  DocumentCard,
  DocumentCardSkeleton,
} from "@/components/documents/card";
import { NewDocumentDialog } from "@/components/documents/new-document-dialog";
import { ErrorAlert } from "@/components/error-alert";

export function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaults = getDefaultDateRangeStrings();
  const fromParam = searchParams.get("from") || defaults.from;
  const toParam = searchParams.get("to") || defaults.to;

  const isoFrom = dateStringToIsoStartOfDay(fromParam);
  const isoTo = dateStringToIsoEndOfDay(toParam);

  const { data, isLoading, isFetching, isPlaceholderData, isError, error } =
    useDocumentSummaryQuery({
      from: isoFrom,
      to: isoTo,
    });

  function handleFromChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", val);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }

  function handleToChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("to", val);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }

  const isSummaryLoading = isLoading || isFetching || isPlaceholderData;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <p className="text-lg text-secondary-foreground/40 font-semibold tracking-tight -mt-1">
            Your documents at a glance
          </p>
        </div>

        <div className="flex items-end gap-3">
          <Field>
            <FieldLabel className="text-xs text-muted-foreground">
              From
            </FieldLabel>
            <Input
              type="date"
              value={fromParam}
              onChange={handleFromChange}
              className="w-36"
            />
          </Field>
          <Field>
            <FieldLabel className="text-xs text-muted-foreground">
              To
            </FieldLabel>
            <Input
              type="date"
              value={toParam}
              onChange={handleToChange}
              className="w-36"
            />
          </Field>
        </div>
      </div>

      {isError && (
        <ErrorAlert
          error={error}
          fallbackMessage="Failed to load summary data"
        />
      )}

      <div className="flex flex-col gap-8 px-2">
        <div className="flex flex-col gap-0.5 items-baseline">
          <h3 className="text-lg font-semibold">Documents Overview</h3>
          <span className="text-xs text-muted-foreground flex gap-1 items-center">
            <InfoIcon size={12} /> As of {formatDate(fromParam)} -{" "}
            {formatDate(toParam)}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isSummaryLoading ? (
            <>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </>
          ) : data ? (
            <>
              <SummaryCard
                title="Grand Total"
                metricString={formatCurrency(data.totals.grandTotal)}
                description={`${data.counts.finalized} finalized document${data.counts.finalized !== 1 ? "s" : ""}`}
              />
              <SummaryCard
                title="Total Tax"
                metricString={formatCurrency(data.totals.totalTax)}
                description="Across finalized documents"
              />
              <SummaryCard
                title="Total Discount"
                metricString={formatCurrency(data.totals.totalDiscount)}
                description="Across finalized documents"
              />
              <SummaryCard
                title="Documents"
                metricString={String(data.counts.total)}
                description={`${data.counts.draft} draft · ${data.counts.finalized} finalized`}
              />
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-8 px-2">
        <div className="flex flex-col gap-0.5 items-baseline">
          <h3 className="text-lg font-semibold">Recent Drafts</h3>
          <span className="text-xs text-muted-foreground flex gap-1 items-center">
            Continue where you left off
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          <NewDocumentDialog />
          {!data ? (
            <>
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
            </>
          ) : (
            data?.recentDraftDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                customer={doc.customer}
                issueDate={doc.issueDate}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8 px-2">
        <div className="flex flex-col gap-0.5 items-baseline">
          <h3 className="text-lg font-semibold">Recent Finalized</h3>
          <span className="text-xs text-muted-foreground flex gap-1 items-center">
            View recently finalized documents
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {!data ? (
            <>
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
            </>
          ) : data?.recentFinalizedDocuments.length === 0 ? (
            <p className="flex items-center text-sm text-muted-foreground">
              No finalized documents
            </p>
          ) : (
            data?.recentFinalizedDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                customer={doc.customer}
                issueDate={doc.issueDate}
                grandTotal={doc.grandTotal}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
