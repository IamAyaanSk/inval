import Link from "next/link";
import { FileText } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type DocumentCardProps = {
  id: string;
  title: string;
  customer: string;
  issueDate: string;
  grandTotal?: string;
};

export function DocumentCard({
  id,
  title,
  customer,
  issueDate,
  grandTotal,
}: DocumentCardProps) {
  return (
    <Link
      href={`/documents/${id}`}
      className="border group flex w-40 shrink-0 flex-col overflow-hidden rounded-xl transition-all hover:ring-primary/40 hover:shadow-md"
    >
      <div className="flex h-48 items-center justify-center bg-muted/40 transition-colors group-hover:bg-primary/5">
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
    <div className="flex w-40 shrink-0 flex-col overflow-hidden rounded-xl">
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
