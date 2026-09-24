"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * Publicarea unei creatii in sectiunea deschisa. Pana acum se putea face doar
 * pe ecranul de dupa generare; daca utilizatorul pleca de pe pagina, lucrarea
 * ramanea privata fara nicio cale de a o publica ulterior.
 */
export default function PublishToggle({
  generationId,
  initialPublic,
}: {
  generationId: string;
  initialPublic: boolean;
}) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    const next = !isPublic;

    try {
      const response = await fetch(`/api/generations/${generationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Modificarea nu a reusit.");
        return;
      }

      setIsPublic(next);
      router.refresh();
    } catch {
      setError("Modificarea nu a reusit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-rule p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        {isPublic ? <Eye size={16} aria-hidden /> : <EyeOff size={16} aria-hidden />}
        {isPublic ? "Vizibil in galerie" : "Doar pentru tine"}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        {isPublic
          ? "Apare in galerie cu modelul si prenumele copilului. Nimic altceva."
          : "Nu apare nicaieri public. Daca o publici, se vad doar modelul si prenumele."}
      </p>

      <button onClick={toggle} disabled={loading} className="btn-ghost mt-4 w-full">
        {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {isPublic ? "Retrage din galerie" : "Publica in galerie"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
