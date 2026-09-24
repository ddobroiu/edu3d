import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { baseUrl } from "@/lib/stripe";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Cere un link de resetare a parolei. Raspunsul este mereu acelasi, ca sa nu
 * dezvaluim ce adrese au cont. In baza se pastreaza doar hash-ul tokenului.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();

  if (email.includes("@")) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(token).digest("hex");
      await prisma.passwordResetToken.deleteMany({ where: { identifier: email } });
      await prisma.passwordResetToken.create({
        data: { identifier: email, token: hash, expires: new Date(Date.now() + 60 * 60 * 1000) },
      });
      await sendPasswordResetEmail(email, `${baseUrl()}/resetare-parola?token=${token}`);
    }
  }

  return NextResponse.json({ ok: true });
}
