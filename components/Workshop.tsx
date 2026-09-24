"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Box, Camera, Coins, Loader2, Pencil, Upload } from "lucide-react";
import ModelViewer from "@/components/ModelViewer";
import ViewOptions from "@/components/ViewOptions";
import Avatar from "@/components/Avatar";
import SchoolLoader from "@/components/SchoolLoader";
import { cn } from "@/lib/utils";
import { words } from "@/lib/wording";
import { GENERATION_COST_IMAGE, GENERATION_COST_TEXT, generationCost } from "@/lib/pricing";

const POLL_MS = 4000;

// Sugestii scurte, nu o taxonomie: se poate cere absolut orice.
const EXAMPLES = ["un elefant", "o floarea-soarelui", "planeta Saturn", "un castel", "o masina de curse"];

type Child = { id: string; name: string; avatar: string };
type Classroom = {
  id: string;
  name: string;
  creditPool: number;
  members: { child: Child }[];
};

type Status = "idle" | "uploading" | "starting" | "working" | "done" | "error";

type Result = {
  id: string;
  status: string;
  stage: string;
  modelUrl: string | null;
  thumbnailUrl: string | null;
  prompt: string | null;
};

export default function Workshop({
  kids,
  classrooms,
  initialSubject,
  credits,
  role,
}: {
  kids: Child[];
  classrooms: Classroom[];
  initialSubject: string | null;
  credits: number;
  role?: string | null;
}) {
  const w = words(role);
  const { update: refreshSession } = useSession();

  const [mode, setMode] = useState<"TEXT" | "IMAGE">("TEXT");
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState<string | null>(initialSubject);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(kids[0]?.id ?? null);

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elevii disponibili depind de contextul ales: clasa sau familie.
  const activeClassroom = classrooms.find((room) => room.id === classroomId) ?? null;
  const availableChildren = activeClassroom
    ? activeClassroom.members.map((member) => member.child)
    : kids;

  useEffect(() => {
    // Cand schimbi clasa, copilul selectat trebuie sa faca parte din ea.
    if (!availableChildren.some((child) => child.id === childId)) {
      setChildId(availableChildren[0]?.id ?? null);
    }
  }, [availableChildren, childId]);

  useEffect(() => () => stopPolling(), []);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  const busy = status === "uploading" || status === "starting" || status === "working";
  const availableCredits = activeClassroom ? activeClassroom.creditPool : credits;
  // Din fotografie costa mai mult decat din text.
  const cost = generationCost(mode);

  async function handleUpload(file: File) {
    setError(null);
    setStatus("uploading");

    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Incarcarea a esuat.");
        setStatus("error");
        return;
      }
      setImageUrl(data.url);
      setStatus("idle");
    } catch {
      setError("Incarcarea a esuat. Verificati conexiunea si incercati din nou.");
      setStatus("error");
    }
  }

  function startPolling(generationId: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/status?id=${generationId}`);
        const data: Result & { error?: string } = await response.json();

        if (data.status === "COMPLETED") {
          stopPolling();
          setResult(data);
          setStatus("done");
          refreshSession();
        } else if (data.status === "FAILED") {
          stopPolling();
          setError(data.error || "Modelul nu a putut fi generat. Creditele au fost returnate in cont.");
          setStatus("error");
          refreshSession();
        } else {
          setResult(data);
        }
      } catch {
        // O eroare de retea trecatoare nu opreste generarea; incercam din nou.
      }
    }, POLL_MS);
  }

  async function handleCreate() {
    setError(null);
    setNeedsCredits(false);
    setResult(null);
    setStatus("starting");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          prompt: mode === "TEXT" ? prompt : undefined,
          imageUrl: mode === "IMAGE" ? imageUrl : undefined,
          childId,
          classroomId,
          subject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Cererea nu a putut fi procesata.");
        setNeedsCredits(Boolean(data.needsCredits));
        setStatus("error");
        return;
      }

      setResult(data);
      setStatus("working");
      refreshSession();
      startPolling(data.id);
    } catch {
      setError("Lucrarea nu a putut fi initiata. Incercati din nou.");
      setStatus("error");
    }
  }

  function reset() {
    stopPolling();
    setResult(null);
    setStatus("idle");
    setError(null);
    setPrompt("");
    setImageUrl(null);
  }

  const canCreate =
    !busy && childId !== null && (mode === "TEXT" ? prompt.trim().length > 1 : Boolean(imageUrl));

  // --- ecranul de rezultat ---
  if (status === "done" && result?.modelUrl) {
    return (
      <ResultView
        result={result}
        childName={availableChildren.find((child) => child.id === childId)?.name}
        onReset={reset}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card p-6 sm:p-8">
        {/* Text sau poza */}
        <div className="mb-6 flex border border-rule">
          <button
            onClick={() => setMode("TEXT")}
            disabled={busy}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-3 font-medium transition-colors",
              mode === "TEXT" ? "bg-brand-600 text-white" : "bg-white text-ink-soft hover:bg-brand-50"
            )}
          >
            <Pencil size={18} aria-hidden />
            Descriere scrisa
          </button>
          <button
            onClick={() => setMode("IMAGE")}
            disabled={busy}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-3 font-medium transition-colors",
              mode === "IMAGE" ? "bg-brand-600 text-white" : "bg-white text-ink-soft hover:bg-brand-50"
            )}
          >
            <Camera size={18} aria-hidden />
            Fotografie
          </button>
        </div>

        {mode === "TEXT" ? (
          <>
            <label className="label" htmlFor="prompt">
              Descrieti obiectul care va fi modelat
            </label>
            <textarea
              id="prompt"
              className="input paper-ruled textarea-paper min-h-28 resize-none"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="celula vegetala, cu peretele si nucleul vizibile"
              maxLength={300}
              disabled={busy}
            />
            <p className="mt-1.5 text-right text-xs text-ink-soft">{prompt.length}/300</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  onClick={() => setPrompt(example)}
                  disabled={busy}
                  className="rounded-full border border-rule px-3 py-1 text-xs text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
                >
                  {example}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="label">Fotografia obiectului</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />

            {imageUrl ? (
              <div className="relative overflow-hidden border border-rule">
                <Image
                  src={imageUrl}
                  alt="Poza incarcata"
                  width={640}
                  height={640}
                  className="h-64 w-full object-contain bg-brand-50"
                  unoptimized
                />
                <button
                  onClick={() => setImageUrl(null)}
                  disabled={busy}
                  className="absolute right-3 top-3 rounded-xl bg-white/90 px-3 py-1.5 text-sm font-semibold text-brand-700 shadow"
                >
                  Schimba
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="flex h-64 w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-brand-200 bg-brand-50/60 text-ink-soft transition-colors hover:border-brand-400"
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 size={32} className="animate-spin text-brand-500" aria-hidden />
                    Se incarca fisierul...
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-brand-400" aria-hidden />
                    <span className="font-semibold">Selectati o fotografie</span>
                    <span className="text-sm">Format JPG, PNG sau WEBP, maximum 8 MB</span>
                  </>
                )}
              </button>
            )}
            <p className="mt-2 text-sm text-ink-soft">
              Rezultatele cele mai bune se obtin cu un singur obiect, fotografiat frontal, pe fundal uniform.
            </p>
          </>
        )}

        {error && (
          <div role="alert" className="mt-6 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-red-800">
            <p className="font-semibold">{error}</p>
            {needsCredits && (
              <Link href="/tarife" className="btn-primary mt-3">
                Cumpara credite
              </Link>
            )}
          </div>
        )}

        {busy && status !== "uploading" && <ProgressPanel stage={result?.stage ?? "IMAGE"} />}

        <button onClick={handleCreate} disabled={!canCreate} className="btn-primary mt-6 w-full text-lg">
          {busy ? (
            <>
              <Loader2 size={20} className="animate-spin" aria-hidden />
              In procesare...
            </>
          ) : (
            <>
              <Box size={20} aria-hidden />
              Genereaza modelul ({cost} credite)
            </>
          )}
        </button>
      </div>

      {/* Coloana din dreapta: cine creeaza si cu ce credite */}
      <aside className="space-y-6">
        {classrooms.length > 0 && (
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold">Context</h2>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setClassroomId(null)}
                disabled={busy}
                className={cn(
                  "w-full border px-4 py-3 text-left font-medium transition-colors",
                  classroomId === null ? "border-brand-600 bg-brand-600 text-white" : "border-rule bg-white text-ink-soft hover:border-brand-300"
                )}
              >
                Acasa
                <span className="block text-sm font-normal opacity-80">
                  Se utilizeaza creditele contului
                </span>
              </button>
              {classrooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setClassroomId(room.id)}
                  disabled={busy}
                  className={cn(
                    "w-full border px-4 py-3 text-left font-medium transition-colors",
                    classroomId === room.id ? "border-brand-600 bg-brand-600 text-white" : "border-rule bg-white text-ink-soft hover:border-brand-300"
                  )}
                >
                  {room.name}
                  <span className="block text-sm font-normal opacity-80">
                    {room.creditPool} credite in bugetul clasei
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="card p-6">
          <h2 className="text-base font-semibold tracking-tight">{w.whoCreates}</h2>
          {availableChildren.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              {w.noProfiles}{" "}
              <Link href="/parinte" className="font-semibold text-brand-700 underline">
                {w.addProfile}
              </Link>
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {availableChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setChildId(child.id)}
                  disabled={busy}
                  aria-pressed={childId === child.id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-sm border p-3 transition-colors",
                    childId === child.id
                      ? "border-brand-600 bg-brand-50"
                      : "border-rule bg-white hover:border-brand-300"
                  )}
                >
                  <Avatar name={child.name} color={child.avatar} />
                  <span className="text-sm font-medium">{child.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card border-l-4 border-l-brand-600 p-6">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <Coins size={20} className="text-sun-600" aria-hidden />
            {availableCredits} credite
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Din text {GENERATION_COST_TEXT} credite, din fotografie {GENERATION_COST_IMAGE}.
            Acopera {Math.floor(availableCredits / GENERATION_COST_TEXT)} lucrari din text.
          </p>
          <Link href="/tarife" className="btn-sun mt-4 w-full">
            Achizitie credite
          </Link>
        </div>
      </aside>
    </div>
  );
}

/** Ce se intampla acum, pe intelesul unui copil. */
function ProgressPanel({ stage }: { stage: string }) {
  const steps =
    stage === "IMAGE"
      ? ["Se analizeaza descrierea", "Se genereaza imaginea de referinta", "Se construieste modelul 3D"]
      : ["Imagine receptionata", "Se construieste geometria", "Se aplica texturile"];
  const activeIndex = stage === "IMAGE" ? 1 : 1;

  return (
    <div className="mt-6 rounded-xl border border-rule bg-brand-50 p-5">
      <SchoolLoader label="Lucrare in procesare" />

      <div className="progress-track mx-auto mt-4 h-1.5 w-full max-w-xs" aria-hidden />

      <ol className="mt-4 space-y-2">
        {steps.map((step, index) => (
          <li
            key={step}
            className={cn(
              "flex items-center gap-2 text-sm",
              index <= activeIndex ? "font-semibold text-ink" : "text-ink-soft"
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full text-xs",
                index < activeIndex
                  ? "bg-brand-600 text-white"
                  : index === activeIndex
                    ? "bg-sun-400 text-ink"
                    : "bg-brand-200 text-brand-700"
              )}
              aria-hidden
            >
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-ink-soft">
        Procesarea dureaza intre unu si trei minute. Pagina poate ramane deschisa.
      </p>
    </div>
  );
}

function ResultView({
  result,
  childName,
  onReset,
}: {
  result: Result;
  childName?: string;
  onReset: () => void;
}) {
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function publish() {
    setPublishing(true);
    try {
      const response = await fetch(`/api/generations/${result.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: true }),
      });
      if (response.ok) setPublished(true);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card overflow-hidden p-3">
        <ModelViewer
          src={result.modelUrl!}
          alt={result.prompt || "Modelul 3D creat"}
          poster={result.thumbnailUrl}
          className="h-[28rem] w-full"
        />
      </div>

      <aside className="space-y-4">
        <div className="card p-6">
          <p className="text-sm font-semibold text-brand-600">Lucrare finalizata</p>
          <h2 className="mt-1 font-display text-2xl font-bold">
            {result.prompt || "Modelul tau 3D"}
          </h2>
          {childName && (
            <p className="mt-1 text-ink-soft">Realizat de {childName.split(" ")[0]}</p>
          )}

          <div className="mt-5 space-y-3">
            <ViewOptions arHref={`/model/${result.id}`} vrHref={`/vr/${result.id}`} />
            <a
              href={result.modelUrl!}
              download
              className="btn-ghost w-full"
            >
              Descarcare fisier GLB
            </a>
            <button onClick={onReset} className="btn-ghost w-full">
              Lucrare noua
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold">Publicare in sectiunea deschisa</h3>
          <p className="mt-1 text-sm text-ink-soft">
            In sectiunea deschisa apar doar modelul si prenumele elevului.
          </p>
          {published ? (
            <p className="mt-4 border-l-4 border-emerald-700 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              Lucrarea a fost publicata.
            </p>
          ) : (
            <button onClick={publish} disabled={publishing} className="btn-sun mt-4 w-full">
              {publishing && <Loader2 size={18} className="animate-spin" aria-hidden />}
              Publica lucrarea
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
