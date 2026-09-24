"use client";

import { useEffect, useState } from "react";

/**
 * Model 3D care se roteste singur, folosit pe pagina principala.
 * Se incarca doar cand ajunge in dreptul ecranului, ca sa nu tragem
 * cateva megaocteti la prima vizita.
 */
export default function SpinModel({ src, alt }: { src: string; alt: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    import("@google/model-viewer")
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        /* fara 3D ramane doar fundalul, nu stricam pagina */
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
      {ready && (
        <model-viewer
          src={src}
          alt={alt}
          camera-controls
          auto-rotate
          disable-zoom
          loading="lazy"
          shadow-intensity="0.6"
          environment-image="neutral"
          tone-mapping="aces"
          touch-action="pan-y"
          style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
        />
      )}
    </div>
  );
}
