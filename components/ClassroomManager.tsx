"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins, Copy, Loader2, Plus, Users } from "lucide-react";
import Avatar from "@/components/Avatar";

type Classroom = {
  id: string;
  name: string;
  grade: string | null;
  joinCode: string;
  creditPool: number;
  active: boolean;
  generationCount: number;
  members: { id: string; name: string; avatar: string }[];
};

export default function ClassroomManager({
  initialClassrooms,
  teacherCredits,
}: {
  initialClassrooms: Classroom[];
  teacherCredits: number;
}) {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState(initialClassrooms);
  const [creating, setCreating] = useState(initialClassrooms.length === 0);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createClassroom(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, grade }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Nu am putut crea clasa.");
        return;
      }

      setClassrooms((current) => [
        { ...data.classroom, generationCount: 0, members: [] },
        ...current,
      ]);
      setName("");
      setGrade("");
      setCreating(false);
      router.refresh();
    } catch {
      setError("Nu am putut crea clasa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {creating ? (
        <form onSubmit={createClassroom} className="card p-6">
          <h2 className="font-display text-xl font-bold">Clasa noua</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="classroom-name">
                Numele clasei
              </label>
              <input
                id="classroom-name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Clasa a III-a B"
                required
                minLength={2}
                maxLength={60}
              />
            </div>
            <div>
              <label className="label" htmlFor="classroom-grade">
                Nivelul (optional)
              </label>
              <input
                id="classroom-grade"
                className="input"
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                placeholder="Clasa a III-a"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading && <Loader2 size={18} className="animate-spin" aria-hidden />}
              Creeaza clasa
            </button>
            {classrooms.length > 0 && (
              <button type="button" onClick={() => setCreating(false)} className="btn-ghost">
                Renunt
              </button>
            )}
          </div>
        </form>
      ) : (
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus size={18} aria-hidden />
          Clasa noua
        </button>
      )}

      {classrooms.map((classroom) => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          teacherCredits={teacherCredits}
          onUpdate={(updated) =>
            setClassrooms((current) =>
              current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
            )
          }
        />
      ))}
    </div>
  );
}

function ClassroomCard({
  classroom,
  teacherCredits,
  onUpdate,
}: {
  classroom: Classroom;
  teacherCredits: number;
  onUpdate: (classroom: Partial<Classroom> & { id: string }) => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function allocate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/classrooms/${classroom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocate: amount }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Alocarea nu a reusit.");
        return;
      }

      onUpdate({ id: classroom.id, creditPool: data.classroom.creditPool });
      router.refresh();
    } catch {
      setError("Alocarea nu a reusit.");
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(classroom.joinCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">{classroom.name}</h2>
          {classroom.grade && <p className="text-ink-soft">{classroom.grade}</p>}
          <p className="mt-1 flex items-center gap-3 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Users size={15} aria-hidden />
              {classroom.members.length} elevi
            </span>
            <span>{classroom.generationCount} creatii</span>
          </p>
        </div>

        <button
          onClick={copyCode}
          className="flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 font-display text-xl font-extrabold tracking-widest text-brand-700 transition hover:bg-brand-100"
          title="Copiaza codul clasei"
        >
          {classroom.joinCode}
          <Copy size={16} aria-hidden />
          <span className="sr-only">Copiaza codul clasei</span>
        </button>
      </div>

      {copied && (
        <p role="status" className="mt-2 text-sm font-semibold text-emerald-600">
          Cod copiat. Da-l parintilor, ca sa isi inscrie copiii in clasa.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-end gap-4 rounded-2xl bg-sun-300/20 p-4">
        <div>
          <p className="flex items-center gap-1.5 font-display text-lg font-bold text-sun-600">
            <Coins size={18} aria-hidden />
            {classroom.creditPool} credite in clasa
          </p>
          <p className="text-sm text-ink-soft">
            Elevii creeaza din acest buget, nu din contul tau.
          </p>
        </div>

        <div className="ml-auto flex items-end gap-2">
          <div>
            <label className="label" htmlFor={`amount-${classroom.id}`}>
              Aloca din cele {teacherCredits} credite
            </label>
            <input
              id={`amount-${classroom.id}`}
              type="number"
              min={10}
              step={10}
              max={teacherCredits}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="input w-32"
            />
          </div>
          <button onClick={allocate} disabled={loading || teacherCredits < amount} className="btn-sun">
            {loading && <Loader2 size={18} className="animate-spin" aria-hidden />}
            Aloca
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
          {error}{" "}
          <Link href="/tarife" className="underline">
            Cumpara credite
          </Link>
        </p>
      )}

      {classroom.members.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {classroom.members.map((child) => (
            <li
              key={child.id}
              className="flex items-center gap-2 rounded-sm border border-rule bg-white px-2.5 py-1.5 text-sm font-medium"
            >
              <Avatar name={child.name} color={child.avatar} size="sm" className="h-5 w-5 text-[0.55rem]" />
              {child.name.split(" ")[0]}
            </li>
          ))}
        </ul>
      )}

      {classroom.members.length === 0 && (
        <p className="mt-5 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-ink-soft">
          Niciun elev inca. Da parintilor codul <strong>{classroom.joinCode}</strong>: il introduc in
          zona lor de cont si copilul intra in clasa.
        </p>
      )}
    </section>
  );
}
