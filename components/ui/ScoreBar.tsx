import AnimatedScoreBar from "@/components/ui/AnimatedScoreBar";

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  barHeight?: number;
  labelWidth?: string;
  showValue?: boolean;
  reason?: string;
  delay?: number;
}

export function ScoreBar({
  label,
  value,
  max = 10,
  color = "#0084FF",
  barHeight = 8,
  labelWidth = "120px",
  showValue = true,
  reason,
  delay = 0,
}: ScoreBarProps) {
  return (
    <div className="w-full">
      <AnimatedScoreBar
        label={label}
        value={value}
        max={max}
        color={color}
        barHeight={barHeight}
        labelWidth={labelWidth}
        showValue={showValue}
        delay={delay}
      />
      {reason && (
        <p className="font-inter text-sm text-muted italic mt-1 ml-[calc(120px+12px)]">
          {reason}
        </p>
      )}
    </div>
  );
}
