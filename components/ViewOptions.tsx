"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Camera, Headset, X } from "lucide-react";

/**
 * Cele doua moduri de vizualizare, care sunt lucruri diferite:
 *
 *   AR - modelul asezat in camera ta, prin camera telefonului. Butonul care il
 *        porneste sta in viewer (ModelViewer), pentru ca doar el are acces la
 *        elementul model-viewer. De pe calculator nu se poate face AR, asa ca
 *        aratam un cod QR: il scanezi si deschizi aceeasi pagina pe telefon.
 *   VR - intri tu in scena, cu o casca. Optiune secundara.
 */
export default function ViewOptions({
  /** Pagina modelului, unde exista butonul de AR. Codul QR duce aici. */
  arHref,
  vrHref,
}: {
  arHref: string;
  vrHref: string;
}) {
  const [showQR, setShowQR] = useState(false);
  const [isTouch, setIsTouch] = useState<boolean | null>(null);
  const [absoluteUrl, setAbsoluteUrl] = useState("");

  useEffect(() => {
    setIsTouch(navigator.maxTouchPoints > 0 || "ontouchstart" in window);
    setAbsoluteUrl(`${window.location.origin}${arHref}`);
  }, [arHref]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Pe calculator, AR se face de pe telefon: dam codul de scanat. */}
        {isTouch === false && (
          <button onClick={() => setShowQR((value) => !value)} className="btn-sun">
            <Camera size={18} aria-hidden />
            {showQR ? "Ascunde codul" : "Vezi in camera ta"}
          </button>
        )}

        <Link href={vrHref} className="btn-ghost">
          <Headset size={18} aria-hidden />
          Vezi in VR
        </Link>
      </div>

      {isTouch === true && (
        <p className="text-sm text-ink-soft">
          Apasa <strong>Vezi in camera ta</strong> pe model ca sa il asezi in camera, prin camera
          telefonului.
        </p>
      )}

      {showQR && absoluteUrl && (
        <div className="relative w-full max-w-xs rounded-xl border border-rule bg-white p-5 text-center">
          <button
            onClick={() => setShowQR(false)}
            className="absolute right-2 top-2 rounded-md p-1.5 text-ink-soft hover:text-ink"
            aria-label="Inchide codul QR"
          >
            <X size={15} aria-hidden />
          </button>

          <div className="mx-auto w-fit rounded-lg bg-white p-2">
            <QRCode value={absoluteUrl} size={144} />
          </div>
          <p className="mt-3 text-sm font-medium">Scaneaza cu telefonul</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Pe telefon apesi &bdquo;Vezi in camera ta&rdquo; si modelul apare langa tine, la marime
            reala, prin camera.
          </p>
        </div>
      )}
    </div>
  );
}
