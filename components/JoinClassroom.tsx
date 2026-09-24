"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, School } from "lucide-react";

/** Parintele introduce codul primit de la profesor si copilul intra in clasa. */
export default function JoinClassroom({
  kids,
}: {
  kids: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [childId, setChildId] = useState(kids[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (kids.length === 0) return null;

  async function join(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, childId }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ ok: false, text: data.error || "Codul introdus nu este valid." });
        return;
      }

      setMessage({ ok: true, text: `Elevul a fost inscris in clasa ${data.classroom.name}.` });
      setCode("");
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Inscrierea nu a putut fi finalizata." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <School size={20} className="text-brand-600" aria-hidden />
        Cod de clasa
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Daca ati primit un cod de acces de la unitatea de invatamant, introduceti-l aici.
      </p>

      {open ? (
        <form onSubmit={join} className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="join-code">
              Cod de acces
            </label>
            <input
              id="join-code"
              className="input font-display text-lg tracking-widest uppercase"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="ABC234"
              required
              maxLength={8}
              autoFocus
            />
          </div>

          {kids.length > 1 && (
            <div>
              <label className="label" htmlFor="join-child">
                Elevul inscris
              </label>
              <select
                id="join-child"
                className="input"
                value={childId}
                onChange={(event) => setChildId(event.target.value)}
              >
                {kids.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {message && (
            <p
              role="alert"
              className={`text-sm font-semibold ${message.ok ? "text-emerald-600" : "text-red-700"}`}
            >
              {message.text}
            </p>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading && <Loader2 size={18} className="animate-spin" aria-hidden />}
              Inscrie
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Renunt
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-ghost mt-4 w-full">
          Introdu codul
        </button>
      )}
    </section>
  );
}
