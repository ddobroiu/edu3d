"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Calculator,
  Compass,
  FlaskConical,
  Globe2,
  Palette,
  Pencil,
  Ruler,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Obiectele din ghiozdan, rotite cat dureaza asteptarea. */
const TOOLS = [Pencil, Ruler, Compass, BookOpen, Globe2, FlaskConical, Calculator, Palette];

const SWITCH_MS = 900;

export default function SchoolLoader({
  label,
  hint,
  className,
}: {
  label: string;
  hint?: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Respectam preferinta de sistem: fara miscare, ramane o singura pictograma.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const timer = setInterval(() => setIndex((value) => (value + 1) % TOOLS.length), SWITCH_MS);
    return () => clearInterval(timer);
  }, []);

  const Tool = TOOLS[index];

  return (
    <div className={cn("text-center", className)} role="status" aria-live="polite">
      <div className="relative mx-auto grid h-16 w-16 place-items-center">
        {/* Cercul care se roteste in jurul pictogramei. */}
        <span
          className="absolute inset-0 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600"
          style={{ animationDuration: "1.4s" }}
          aria-hidden
        />
        <Tool
          key={index}
          size={24}
          className="animate-tool-pop text-brand-600"
          aria-hidden
        />
      </div>

      <p className="mt-4 font-medium">{label}</p>
      {hint && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{hint}</p>}
    </div>
  );
}
