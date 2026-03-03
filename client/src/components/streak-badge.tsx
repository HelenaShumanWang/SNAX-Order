import { Flame } from "lucide-react";

interface StreakBadgeProps {
  count: number;
  size?: "sm" | "md" | "lg";
}

export function StreakBadge({ count, size = "md" }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-lg gap-1.5",
    lg: "text-2xl gap-2",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]} font-bold`} data-testid="streak-badge">
      <Flame className={`${iconSizes[size]} text-orange-500`} />
      <span className="text-foreground">{count}</span>
      <span className="text-muted-foreground font-normal text-sm">day streak</span>
    </div>
  );
}
