import { Skeleton } from "@/components/ui/skeleton";

export const SummaryCardSkeleton = () => {
  return (
    <div className="h-36 rounded-4xl bg-muted/30 p-6 flex flex-col justify-center gap-2.5 border-l-4 border-muted">
      <Skeleton className="h-4 w-24" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
};

export const SummaryCard = ({
  title,
  metricString,
  description,
}: {
  title: string;
  metricString: string;
  description: string;
}) => {
  return (
    <div className="h-36 shadow-sm rounded-4xl bg-muted/30 p-6 flex flex-col justify-center gap-2.5 border-l-4 border-primary">
      <h4 className="text-sm font-medium">{title}</h4>
      <div className="flex flex-col gap-1.5">
        <p className="text-[28px] font-bold">{metricString}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
};
