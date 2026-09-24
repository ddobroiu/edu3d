import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { WELCOME_CREDITS } from "@/lib/credits";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    const role = body.role === "TEACHER" ? "TEACHER" : "PARENT";
    const schoolName = role === "TEACHER" ? String(body.schoolName || "").trim() || null : null;

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Adresa de email nu pare corecta." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Parola trebuie sa aiba cel putin 8 caractere." },
        { status: 400 }
      );
    }
    if (!name) {
      return NextResponse.json({ error: "Spune-ne cum te cheama." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { error: "Exista deja un cont cu acest email. Incearca sa te autentifici." },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        schoolName,
        passwordHash: await bcrypt.hash(password, 10),
        credits: WELCOME_CREDITS,
      },
      select: { id: true },
    });

    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: WELCOME_CREDITS,
        type: "BONUS",
        description: "Credite de bun venit pe edu3d",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Nu am putut crea contul. Incearca din nou." }, { status: 500 });
  }
}
