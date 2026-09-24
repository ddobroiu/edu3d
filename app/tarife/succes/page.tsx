import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Plata reusita" };
export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/autentificare");

  const { session_id: stripeSessionId } = await searchParams;

  // Creditele le adauga webhook-ul Stripe. Pagina doar arata starea comenzii,
  // iar daca webhook-ul inca nu a ajuns, spunem clar ca urmeaza in cateva secunde.
  // Soldul real dupa ce webhookul a adaugat creditele.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  const purchase = stripeSessionId
    ? await prisma.purchase.findFirst({
        where: { stripeSessionId, userId: session.user.id },
        select: { credits: true, status: true, amount: true },
      })
    : null;

  const settled = purchase?.status === "COMPLETED";

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-sun-300/40 text-sun-600">
        <PartyPopper size={40} aria-hidden />
      </span>

      <h1 className="mt-6 font-display text-3xl font-extrabold">Multumim pentru plata!</h1>

      {purchase ? (
        settled ? (
          <p className="mt-3 text-lg text-ink-soft">
            Cele {purchase.credits} credite sunt deja in contul tau. Ai acum{" "}
            <strong className="text-brand-700">{user?.credits ?? 0}</strong> credite.
          </p>
        ) : (
          <p className="mt-3 text-lg text-ink-soft">
            Plata a fost inregistrata. Cele {purchase.credits} credite apar in cont in cateva
            secunde, imediat ce primim confirmarea de la procesatorul de plati.
          </p>
        )
      ) : (
        <p className="mt-3 text-lg text-ink-soft">
          Verificam plata. Creditele apar in cont in cateva momente.
        </p>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/creeaza" className="btn-primary">
          Mergi la atelier
        </Link>
        <Link href="/parinte" className="btn-ghost">
          Vezi contul
        </Link>
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        Factura ajunge pe email in cateva minute.
      </p>
    </div>
  );
}
