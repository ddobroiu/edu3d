import { avatarColor, initials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

/** Initialele elevului pe fundal colorat -- identificare sobra, fara ilustratii. */
export default function Avatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimensions = {
    sm: "h-7 w-7 text-[0.65rem]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
  }[size];

  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-sm font-semibold tracking-wide text-white",
        dimensions,
        className
      )}
      style={{ backgroundColor: avatarColor(color) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
