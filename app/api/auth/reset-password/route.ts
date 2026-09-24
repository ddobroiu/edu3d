import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Seteaza parola noua pe baza tokenului primit pe email (valabil o ora, o singura data). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");

  if (password.length < 8) {
    return NextResponse.json({ error: "Parola trebuie sa aiba cel putin 8 caractere." }, { status: 400 });
  }

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { token: hash } });
  if (!record || record.expires < new Date()) {
    return NextResponse.json(
      { error: "Linkul a expirat sau a fost deja folosit. Cere un link nou." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  await prisma.passwordResetToken.deleteMany({ where: { identifier: record.identifier } });

  return NextResponse.json({ ok: true });
}
