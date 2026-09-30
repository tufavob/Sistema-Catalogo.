import { STATUS_LABEL, getStatusBadgeClass } from "@/lib/status";
import type { ProductStatus } from "@/types/database";

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide ${getStatusBadgeClass(status)}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}