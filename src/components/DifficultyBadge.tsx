import { cn } from "@/lib/utils";

type Difficulty = "Easy" | "Medium" | "Hard";

const styles: Record<Difficulty, string> = {
  Easy: "bg-difficulty-easy/10 text-difficulty-easy border-difficulty-easy/20",
  Medium: "bg-difficulty-medium/10 text-difficulty-medium border-difficulty-medium/20",
  Hard: "bg-difficulty-hard/10 text-difficulty-hard border-difficulty-hard/20",
};

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
      styles[difficulty], className
    )}>
      {difficulty}
    </span>
  );
}
