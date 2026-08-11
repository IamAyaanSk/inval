import Link from "next/link";
import { FileText } from "lucide-react";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
  return (
    <Link
      href={`/dashboard/documents/${id}`}
      className="border group flex w-40 shrink-0 flex-col overflow-hidden rounded-xl transition-all hover:ring-primary/40 hover:shadow-md"
    >
      <div className="relative flex h-48 items-center justify-center bg-muted/40 transition-colors group-hover:bg-primary/5">
        {status && (
          <Badge
            variant={status === "FINALIZED" ? "default" : "outline"}
            className={cn(
              "absolute top-2 right-2 text-[10px] px-1.5 py-0 font-semibold tracking-wide",
              status === "FINALIZED"
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-background/90 text-muted-foreground border-border"
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
