"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function RefreshTableButton({ label = "Refresh table" }: { label?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const refreshTable = () => {
    startTransition(() => {
      router.refresh();
      setLastRefreshed(new Date());
    });
  };

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        onClick={refreshTable}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full border border-[#006cff]/18 bg-white/80 px-4 py-2 font-inter text-xs font-extrabold text-[#006cff] shadow-[0_12px_28px_rgba(0,108,255,0.08)] transition hover:-translate-y-0.5 hover:border-[#006cff]/35 hover:bg-[#eaf5ff] disabled:cursor-wait disabled:opacity-70"
      >
        <RefreshCw
          className={cn("h-4 w-4", isPending && "animate-spin")}
          strokeWidth={2.4}
        />
        {isPending ? "Refreshing..." : label}
      </button>
      {lastRefreshed && (
        <span className="font-inter text-[11px] font-semibold text-[#64748b]">
          Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}
