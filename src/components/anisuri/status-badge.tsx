import { CalendarCheck, CircleCheck, CircleSlash, Clock } from "lucide-react";
import { cva } from "class-variance-authority";

import { STATUS_INFO } from "@/lib/demo/format";
import type { RequestStatus } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold [&_svg]:size-4",
  {
    variants: {
      status: {
        pending: "bg-status-pending text-status-pending-foreground",
        scheduled: "bg-status-scheduled text-status-scheduled-foreground",
        completed: "bg-status-completed text-status-completed-foreground",
        unavailable: "bg-status-unavailable text-status-unavailable-foreground",
      },
    },
  },
);

const ICONS = {
  pending: Clock,
  scheduled: CalendarCheck,
  completed: CircleCheck,
  unavailable: CircleSlash,
} as const;

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  const Icon = ICONS[status];
  return (
    <span className={cn(badge({ status }), className)}>
      <Icon aria-hidden="true" />
      {STATUS_INFO[status].label}
    </span>
  );
}
