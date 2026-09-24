"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Box } from "lucide-react";
import ModelViewer from "@/components/ModelViewer";
import ViewOptions from "@/components/ViewOptions";
import SchoolLoader from "@/components/SchoolLoader";
import { LIBRARY_OPEN_COST } from "@/lib/pricing";

type Props = {
  uid: string;
  name: string;
  thumbnail: string | null;
  /** Setate cand modelul a fost deja adus in platforma. */
  modelUrl: string | null;
  iosUrl: string | null;
  loggedIn: boolean;
  /** Utilizatorul a platit deja deschiderea acestui model. */
  alreadyUnlocked: boolean;
};

type State = "idle" | "preparing" | "ready" | "error";

const POLL_MS = 3000;

/**
 * Afiseaza modelul in viewerul platformei. Daca fisierul nu a fost inca adus
 * la noi, il cere o singura data, apoi il randeaza exact ca pe un model
 * generat de utilizator: acelasi viewer, acelasi AR.
 */
export default function LibraryViewer({
  uid,
  name,
  thumbnail,
  modelUrl,
  iosUrl,
  loggedIn,
  alreadyUnlocked,
}: Props) {
  const { update: refreshSession } = useSession();
  const [state, setState] = useState<State>(modelUrl ? "ready" : "idle");
  const [url, setUrl] = useState(modelUrl);
  const [ios, setIos] = useState(iosUrl);
  const [error, setError] = useState<string | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const prepare = useCallback(async () => {
    setState("preparing");
    setError(null);
    setNeedsCredits(false);

    try {
      const response = await fetch("/api/library/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await response.json();

      if (response.ok && data.status === "READY") {
        setUrl(data.modelUrl);
        setIos(data.iosUrl ?? null);
        setState("ready");
        // Deschiderea a costat credite: actualizam soldul din bara de sus.
        refreshSession();
        return;
      }

      // Alt vizitator a pornit deja descarcarea; mai asteptam.
      if (response.ok && data.status === "PENDING") {
        pollRef.current = setTimeout(prepare, POLL_MS);
        return;
      }

      setError(data.error || "Modelul nu a putut fi pregatit.");
      setNeedsCredits(Boolean(data.needsCredits));
      setState("error");
    } catch {
      setError("Conexiune intrerupta. Incearca din nou.");
      setState("error");
    }
  }, [uid, refreshSession]);

  if (state === "ready" && url) {
    return (
      <div className="space-y-5">
        <ModelViewer
          src={url}
          alt={name}
          poster={thumbnail}
          iosSrc={ios}
          className="h-[60vh] min-h-[24rem] w-full"
        />
        <ViewOptions arHref={`/modele/${uid}`} vrHref={`/vr/${uid}`} />
      </div>
    );
  }

  return (
    <div className="relative flex h-[60vh] min-h-[24rem] w-full items-center justify-center overflow-hidden rounded-xl border border-rule bg-surface">
      {thumbnail && (
        <Image
          src={thumbnail}
          alt={name}
          fill
          className="object-cover opacity-25 blur-sm"
          sizes="100vw"
          unoptimized
          priority
        />
      )}

      <div className="relative z-10 max-w-sm px-6 text-center">
        {state === "preparing" ? (
          <>
            <SchoolLoader
              label="Se pregateste modelul"
              hint="Il aducem in platforma o singura data. Dureaza cateva secunde."
            />
          </>
        ) : state === "error" ? (
          <>
            <p className="font-medium">{error}</p>
            {needsCredits ? (
              <Link href="/tarife" className="btn-primary mt-5">
                Cumpara credite
              </Link>
            ) : (
              <button onClick={prepare} className="btn-ghost mt-5">
                Incearca din nou
              </button>
            )}
          </>
        ) : loggedIn ? (
          <>
            <Box size={28} className="mx-auto text-ink-soft" aria-hidden />
            <p className="mt-4 font-medium">{name}</p>
            {!alreadyUnlocked && (
              <p className="mt-1 text-sm text-ink-soft">
                Prima deschidere costa {LIBRARY_OPEN_COST} credite. Dupa aceea il poti revedea
                oricand, gratuit.
              </p>
            )}
            <button onClick={prepare} className="btn-primary mt-5">
              {alreadyUnlocked
                ? "Deschide modelul"
                : `Deschide modelul (${LIBRARY_OPEN_COST} credite)`}
            </button>
          </>
        ) : (
          <>
            <Box size={28} className="mx-auto text-ink-soft" aria-hidden />
            <p className="mt-4 font-medium">{name}</p>
            <p className="mt-1 text-sm text-ink-soft">
              Autentifica-te ca sa deschizi modelul in 3D si AR.
            </p>
            <Link href="/autentificare" className="btn-primary mt-5">
              Autentificare
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
