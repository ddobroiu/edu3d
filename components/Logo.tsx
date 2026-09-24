import { cn } from "@/lib/utils";

/**
 * Marca platformei: un cub izometric desenat, nu animat permanent.
 *
 * Cele trei fete vizibile au tonuri diferite, asa ca volumul se citeste
 * instant, la orice dimensiune. Se misca doar la hover -- fata de sus se
 * ridica putin, ca si cum cubul s-ar desface.
 */
export default function Logo({
  size = 28,
  className,
  tone = "dark",
  withWordmark = true,
}: {
  size?: number;
  className?: string;
  /** Pe fundal inchis, textul trece pe alb. */
  tone?: "dark" | "light";
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("group/logo flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="edu3d-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="edu3d-left" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="edu3d-right" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3730a3" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
        </defs>

        {/* Fata stanga */}
        <path
          d="M4 9.5 16 16.3v12.2L4 21.7V9.5Z"
          fill="url(#edu3d-left)"
          strokeLinejoin="round"
        />
        {/* Fata dreapta */}
        <path
          d="M28 9.5 16 16.3v12.2l12-6.8V9.5Z"
          fill="url(#edu3d-right)"
          strokeLinejoin="round"
        />
        {/* Fata de sus, singura care se misca */}
        <path
          d="M16 3 28 9.5 16 16.3 4 9.5 16 3Z"
          fill="url(#edu3d-top)"
          strokeLinejoin="round"
          className="origin-center transition-transform duration-300 ease-out group-hover/logo:-translate-y-[3px]"
        />
      </svg>

      {withWordmark && (
        <span
          className={cn(
            "font-semibold leading-none tracking-[-0.045em]",
            tone === "light" ? "text-white" : "text-ink"
          )}
          style={{ fontSize: `${size * 0.68}px` }}
        >
          Edu
          <span className="bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text text-transparent">
            3D
          </span>
        </span>
      )}
    </span>
  );
}
