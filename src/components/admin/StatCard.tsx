import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, loading, className }: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-xl border border-burgundy/15 bg-white/60 p-5", className)}>
        <div className="mb-3 h-10 w-10 animate-pulse rounded-lg bg-burgundy/10" />
        <div className="mb-2 h-4 w-24 animate-pulse rounded bg-burgundy/10" />
        <div className="h-8 w-32 animate-pulse rounded bg-burgundy/10" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-burgundy/15 bg-white/60 p-5 shadow-sm", className)}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold text-brown">{value}</p>
      {trend && <p className="mt-1 text-xs text-green">{trend}</p>}
    </div>
  );
}
