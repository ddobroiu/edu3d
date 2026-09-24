"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Fara token: cerem emailul si trimitem linkul. Cu token (din email): parola noua. */
export default function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(token ? "/api/auth/reset-password" : "/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token, password } : { email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Ceva nu a mers. Incearca din nou.");
      else setDone(true);
    } catch {
      setError("Nu am putut contacta serverul. Incearca din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-8">
      <h1 className="font-display text-2xl font-extrabold">
        {token ? "Alege o parola noua" : "Ai uitat parola?"}
      </h1>

      {done ? (
        <div className="mt-4 space-y-4 text-ink-soft">
          <p>
            {token
              ? "Parola a fost schimbata. Te poti autentifica acum cu parola noua."
              : "Daca exista un cont cu aceasta adresa, am trimis un email cu linkul de resetare. Verifica si folderul Spam."}
          </p>
          <Link href="/autentificare" className="btn-primary w-full">
            Mergi la autentificare
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {token ? (
            <div>
              <label className="label" htmlFor="password">
                Parola noua
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 caractere"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          ) : (
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
          )}

          {error && (
            <p role="alert" className="border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 size={18} className="animate-spin" aria-hidden />}
            {token ? "Salveaza parola" : "Trimite linkul de resetare"}
          </button>
        </form>
      )}
    </div>
  );
}
