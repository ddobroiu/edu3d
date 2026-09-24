"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { GraduationCap, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [isRegister, setIsRegister] = useState(params.get("mod") === "cont-nou");
  const [role, setRole] = useState<"PARENT" | "TEACHER">("PARENT");
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role, schoolName }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Contul nu a putut fi creat.");
          return;
        }
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(
          isRegister
            ? "Contul a fost creat, insa autentificarea automata a esuat. Autentificati-va manual."
            : "Adresa de email sau parola sunt incorecte."
        );
        return;
      }

      router.push(role === "TEACHER" && isRegister ? "/clasa" : "/parinte");
      router.refresh();
    } catch {
      setError("A survenit o eroare. Incercati din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-8">
      <div className="mb-6 flex border border-rule">
        <button
          type="button"
          onClick={() => setIsRegister(false)}
          className={cn(
            "flex-1 py-2.5 font-medium transition-colors",
            !isRegister ? "bg-brand-600 text-white" : "bg-white text-ink-soft hover:bg-brand-50"
          )}
        >
          Autentificare
        </button>
        <button
          type="button"
          onClick={() => setIsRegister(true)}
          className={cn(
            "flex-1 py-2.5 font-medium transition-colors",
            isRegister ? "bg-brand-600 text-white" : "bg-white text-ink-soft hover:bg-brand-50"
          )}
        >
          Cont nou
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <fieldset>
              <legend className="label">Tipul contului</legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("PARENT")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-sm border p-4 transition-colors",
                    role === "PARENT"
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-rule hover:border-brand-300"
                  )}
                  aria-pressed={role === "PARENT"}
                >
                  <Users size={22} aria-hidden />
                  <span className="font-medium">Parinte</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("TEACHER")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-sm border p-4 transition-colors",
                    role === "TEACHER"
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-rule hover:border-brand-300"
                  )}
                  aria-pressed={role === "TEACHER"}
                >
                  <GraduationCap size={22} aria-hidden />
                  <span className="font-medium">Cadru didactic</span>
                </button>
              </div>
            </fieldset>

            <div>
              <label className="label" htmlFor="name">
                Nume si prenume
              </label>
              <input
                id="name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Maria Popescu"
                required
                autoComplete="name"
              />
            </div>

            {role === "TEACHER" && (
              <div>
                <label className="label" htmlFor="school">
                  Unitatea de invatamant (optional)
                </label>
                <input
                  id="school"
                  className="input"
                  value={schoolName}
                  onChange={(event) => setSchoolName(event.target.value)}
                  placeholder="Scoala Gimnaziala Nr. 1"
                />
              </div>
            )}
          </>
        )}

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@exemplu.ro"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Parola
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isRegister ? "Minimum 8 caractere" : ""}
            required
            minLength={isRegister ? 8 : undefined}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </div>

        {error && (
          <p role="alert" className="border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 size={18} className="animate-spin" aria-hidden />}
          {isRegister ? "Creare cont" : "Autentificare"}
        </button>

        {isRegister && (
          <p className="text-center text-xs text-ink-soft">
            Prin crearea contului confirmati ca sunteti adultul care administreaza profilurile elevilor si ca acceptati termenii de utilizare.
          </p>
        )}
      </form>
    </div>
  );
}
