import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ItemStatus, string> = {
  IN_STOCK: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-400",
  OUT_OF_STOCK: "bg-destructive/10 text-destructive ring-destructive/20",
  PENDING: "bg-amber-500/10 text-amber-700 ring-amber-600/20 dark:text-amber-500",
};

type ItemStatus = "IN_STOCK" | "OUT_OF_STOCK" | "PENDING";

const STATUS_LABEL: Record<ItemStatus, string> = {
  IN_STOCK: "In stock",
  OUT_OF_STOCK: "Out of stock",
  PENDING: "Pending",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status in STATUS_LABEL ? (status as ItemStatus) : "PENDING";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLES[key],
      )}
    >
      {STATUS_LABEL[key]}
    </span>
  );
}