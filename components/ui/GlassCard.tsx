import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-[50px]",
        className
      )}
    >
      {children}
    </div>
  );
}
