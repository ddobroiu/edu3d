"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BuyButton({
  packageId,
  loggedIn,
  popular,
}: {
  packageId: string;
  loggedIn: boolean;
  popular?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!loggedIn) {
      router.push("/autentificare?mod=cont-nou");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        setError(data.error || "Nu am putut deschide pagina de plata.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Nu am putut deschide pagina de plata.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`${popular ? "btn-primary" : "btn-ghost"} mt-7 w-full text-lg`}
      >
        {loading && <Loader2 size={18} className="animate-spin" aria-hidden />}
        {loggedIn ? "Achizitie credite" : "Creare cont si achizitie"}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </>
  );
}
