import { cn } from "@/lib/utils";

export function SproutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("h-8 w-8", className)}>
      <rect width="32" height="32" rx="10" className="fill-primary" />
      <path
        d="M16 25v-9.5"
        className="stroke-primary-foreground"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M16 16.5c0-4.4-3.2-7.3-7.6-7.3 0 4.4 3.2 7.3 7.6 7.3Z" className="fill-leaf" />
      <path d="M16 14.5c0-4 2.9-6.6 6.9-6.6 0 4-2.9 6.6-6.9 6.6Z" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SproutMark className={size === "lg" ? "h-11 w-11" : "h-8 w-8"} />
      <span
        className={cn(
          "font-bold tracking-tight text-foreground",
          size === "lg" ? "text-2xl" : "text-lg",
        )}
      >
        AniSuri
      </span>
    </span>
  );
}
