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
        className="inline-flex items-center gap-2 rounded-full border border-[#006cff]/25 bg-[#006cff]/10 px-4 py-2 font-inter text-xs font-extrabold text-[#60b1ff] transition hover:border-[#006cff]/45 hover:bg-[#006cff]/15 hover:text-white disabled:cursor-wait disabled:opacity-70"
      >
        <RefreshCw
          className={cn("h-4 w-4", isPending && "animate-spin")}
          strokeWidth={2.4}
        />
        {isPending ? "Refreshing..." : label}
      </button>
      {lastRefreshed && (
        <span className="font-inter text-[11px] font-semibold text-white/25">
          Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}
