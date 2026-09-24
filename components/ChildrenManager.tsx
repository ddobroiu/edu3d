"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { AVATAR_COLORS, DEFAULT_AVATAR, avatarColor } from "@/lib/avatar";
import { words } from "@/lib/wording";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

type Child = {
  id: string;
  name: string;
  avatar: string;
  _count: { generations: number };
};

export default function ChildrenManager({
  initialChildren,
  role,
}: {
  initialChildren: Child[];
  role?: string | null;
}) {
  const w = words(role);
  const router = useRouter();
  const [children, setChildren] = useState(initialChildren);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addChild(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Profilul nu a putut fi adaugat.");
        return;
      }

      setChildren((current) => [...current, { ...data.child, _count: { generations: 0 } }]);
      setName("");
      setAvatar(DEFAULT_AVATAR);
      setAdding(false);
      router.refresh();
    } catch {
      setError("Profilul nu a putut fi adaugat.");
    } finally {
      setLoading(false);
    }
  }

  async function removeChild(id: string, childName: string) {
    if (!confirm(w.deleteConfirm(childName))) return;

    const response = await fetch(`/api/children/${id}`, { method: "DELETE" });
    if (response.ok) {
      setChildren((current) => current.filter((child) => child.id !== id));
      router.refresh();
    }
  }

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold tracking-tight">{w.profilesTitle}</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {w.profilesHint}
      </p>

      <ul className="mt-4 space-y-2">
        {children.map((child) => (
          <li
            key={child.id}
            className="flex items-center gap-3 border-b border-rule px-1 py-3 last:border-b-0"
          >
            <Avatar name={child.name} color={child.avatar} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{child.name}</p>
              <p className="text-xs text-ink-soft">
                {child._count.generations} {w.creations}
              </p>
            </div>
            <button
              onClick={() => removeChild(child.id, child.name)}
              className="rounded-sm p-2 text-ink-soft transition-colors hover:bg-brand-50 hover:text-red-700"
              aria-label={`Sterge profilul ${child.name}`}
            >
              <Trash2 size={16} aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <form onSubmit={addChild} className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="child-name">
              {w.nameLabel}
            </label>
            <input
              id="child-name"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Andrei"
              required
              minLength={2}
              maxLength={40}
              autoFocus
            />
          </div>

          <div>
            <p className="label">Culoarea profilului</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(AVATAR_COLORS).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAvatar(key)}
                  aria-pressed={avatar === key}
                  aria-label={`Culoare ${key}`}
                  className={cn(
                    "h-9 w-9 rounded-sm border-2 transition-colors",
                    avatar === key ? "border-ink" : "border-transparent hover:border-brand-300"
                  )}
                  style={{ backgroundColor: avatarColor(key) }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Profilul apare cu initialele {w.child}ului pe fundalul ales.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading && <Loader2 size={18} className="animate-spin" aria-hidden />}
              Salveaza
            </button>
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost">
              Anuleaza
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="btn-ghost mt-4 w-full">
          <Plus size={18} aria-hidden />
          {w.addProfile}
        </button>
      )}
    </section>
  );
}
