/**
 * Emailuri trimise prin Resend (bun venit, confirmarea platii, resetarea parolei).
 *
 * Un email care nu pleaca nu opreste niciodata actiunea principala (contul,
 * plata, cererea de resetare): eroarea se scrie doar in log.
 */
import { Resend } from "resend";
import { COMPANY } from "./company";
import { baseUrl } from "./stripe";

let client: Resend | null = null;

function resend() {
  if (!process.env.RESEND_API_KEY) return null;
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM = () => process.env.EMAIL_FROM || `edu3d <${COMPANY.email}>`;

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Aspect comun: text simplu, un singur buton, subsol cu datele firmei. */
function layout(title: string, paragraphs: string[], button?: { label: string; url: string }) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px;line-height:1.55">${p}</p>`).join("");
  const cta = button
    ? `<p style="margin:22px 0"><a href="${button.url}" style="background:#1f6feb;color:#fff;text-decoration:none;padding:11px 18px;border-radius:6px;display:inline-block;font-weight:600">${escape(button.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#1d2330">
<div style="max-width:560px;margin:0 auto;padding:28px 18px">
<div style="background:#fff;border:1px solid #e3e6eb;border-radius:10px;padding:28px">
<h1 style="font-size:20px;margin:0 0 18px">${escape(title)}</h1>${body}${cta}
</div>
<p style="font-size:12px;color:#7a8190;margin:16px 4px 0;line-height:1.5">${escape(COMPANY.brand)} · ${escape(COMPANY.name)} · CUI ${COMPANY.cui}<br>
<a href="${baseUrl()}" style="color:#7a8190">${baseUrl().replace(/^https?:\/\//, "")}</a> · ${escape(COMPANY.email)}</p>
</div></body></html>`;
}

async function send(to: string, subject: string, html: string, text: string) {
  const r = resend();
  if (!r) {
    console.warn("[email] RESEND_API_KEY lipseste; emailul nu a fost trimis:", subject);
    return false;
  }
  try {
    const { error } = await r.emails.send({ from: FROM(), to: [to], subject, html, text });
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    console.error("[email] trimitere esuata:", subject, error);
    return false;
  }
}

export function sendWelcomeEmail(to: string, name: string | null, credits: number) {
  const hi = name ? `Salut, ${escape(name)}!` : "Salut!";
  return send(
    to,
    "Bine ai venit pe edu3d",
    layout("Bine ai venit pe edu3d", [
      hi,
      `Contul tau este gata si ai primit <strong>${credits} credite</strong> de bun venit, suficiente pentru prima creatie 3D.`,
      "Din cont poti adauga profiluri de elev si poti crea modele 3D din text sau din imagini.",
    ], { label: "Creeaza primul model 3D", url: `${baseUrl()}/creeaza` }),
    `${name ? `Salut, ${name}!` : "Salut!"}\n\nContul tau edu3d este gata si ai primit ${credits} credite de bun venit.\n\nIncepe aici: ${baseUrl()}/creeaza`,
  );
}

export function sendPurchaseEmail(
  to: string,
  opts: { name: string | null; credits: number; amount: number; currency: string; invoiceUrl: string | null },
) {
  const price = `${opts.amount.toFixed(2)} ${opts.currency}`;
  return send(
    to,
    `Confirmare plata: ${opts.credits} credite edu3d`,
    layout("Plata a fost confirmata", [
      opts.name ? `Salut, ${escape(opts.name)}!` : "Salut!",
      `Am primit plata de <strong>${price}</strong>. In contul tau au fost adaugate <strong>${opts.credits} credite</strong>.`,
      opts.invoiceUrl
        ? `Factura este disponibila aici: <a href="${opts.invoiceUrl}">descarca factura</a>.`
        : "Factura va fi emisa in scurt timp si o vei gasi in cont.",
    ], { label: "Mergi la creatii", url: `${baseUrl()}/creeaza` }),
    `Am primit plata de ${price}. Au fost adaugate ${opts.credits} credite in contul tau.\n${opts.invoiceUrl ? `Factura: ${opts.invoiceUrl}\n` : ""}\n${baseUrl()}/creeaza`,
  );
}

export function sendPasswordResetEmail(to: string, link: string) {
  return send(
    to,
    "Resetarea parolei edu3d",
    layout("Resetarea parolei", [
      "Am primit o cerere de resetare a parolei pentru contul tau edu3d.",
      "Linkul de mai jos este valabil <strong>o ora</strong>. Daca nu ai cerut tu resetarea, poti ignora acest email: parola ramane aceeasi.",
    ], { label: "Alege o parola noua", url: link }),
    `Am primit o cerere de resetare a parolei pentru contul tau edu3d.\nLinkul este valabil o ora:\n${link}\n\nDaca nu ai cerut tu resetarea, ignora acest email.`,
  );
}
