"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Maximize2 } from "lucide-react";
import SchoolLoader from "@/components/SchoolLoader";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  poster?: string | null;
  /** USDZ pentru AR pe iPhone, daca il avem. */
  iosSrc?: string | null;
  className?: string;
  /** Ascunde butoanele pentru afisajele mici din liste. */
  compact?: boolean;
};

/**
 * <model-viewer> face treaba grea: incarcare GLB, orbit, AR pe telefon.
 * Il incarcam doar in browser, pentru ca defineste un custom element.
 */
/** Elementul model-viewer, cu partile de care avem nevoie. */
type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean;
  activateAR?: () => void;
};

export default function ModelViewer({ src, alt, poster, iosSrc, className, compact = false }: Props) {
  const [ready, setReady] = useState(false);
  const [canAR, setCanAR] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ModelViewerElement>(null);

  useEffect(() => {
    let active = true;
    import("@google/model-viewer")
      .then(() => {
        if (active) setReady(true);
      })
      .catch((error) => console.error("[model-viewer] incarcare esuata:", error));
    return () => {
      active = false;
    };
  }, []);

  // `canActivateAR` devine true abia dupa ce modelul s-a incarcat si doar pe
  // dispozitivele care chiar suporta AR (telefoane si tablete).
  useEffect(() => {
    if (!ready) return;
    const viewer = viewerRef.current;
    if (!viewer) return;

    const check = () => setCanAR(Boolean(viewer.canActivateAR));
    viewer.addEventListener("load", check);
    check();

    return () => viewer.removeEventListener("load", check);
  }, [ready, src]);

  const openInRoom = () => viewerRef.current?.activateAR?.();

  const openFullscreen = () => {
    containerRef.current?.requestFullscreen?.().catch(() => {
      /* pe iOS fullscreen poate fi blocat, nu e critic */
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-100 to-brand-200",
        className
      )}
    >
      {ready ? (
        <model-viewer
          ref={viewerRef}
          src={src}
          alt={alt}
          poster={poster || undefined}
          ios-src={iosSrc || undefined}
          camera-controls
          auto-rotate
          ar
          ar-modes="webxr scene-viewer quick-look"
          shadow-intensity="1"
          environment-image="neutral"
          tone-mapping="aces"
          touch-action="pan-y"
          style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
        />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <SchoolLoader label="Se incarca modelul" />
        </div>
      )}

      {/* Butonul AR apare doar pe telefoane si tablete, unde chiar functioneaza. */}
      {!compact && ready && canAR && (
        <button
          onClick={openInRoom}
          className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-ink/90 px-4 py-2.5 text-sm font-medium text-white shadow-sm backdrop-blur transition-colors hover:bg-ink"
        >
          <Camera size={17} aria-hidden />
          Vezi in camera ta
        </button>
      )}

      {!compact && ready && (
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={openFullscreen}
            className="grid h-9 w-9 place-items-center rounded-lg bg-white/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white"
            aria-label="Ecran complet"
          >
            <Maximize2 size={18} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
