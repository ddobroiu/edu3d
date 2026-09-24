"use client";

import { useState } from "react";
import { Check, Loader2, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

type Billing = {
  type: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  cui: string | null;
  regCom: string | null;
  address: string;
  city: string;
  county: string | null;
  country: string;
  zip: string | null;
} | null;

/**
 * Datele de facturare. Fara ele, factura nu poate fi emisa automat dupa plata,
 * asa ca formularul apare direct in cont, nu ascuns intr-un meniu.
 */
export default function BillingForm({ initial }: { initial: Billing }) {
  const [open, setOpen] = useState(!initial);
  const [type, setType] = useState(initial?.type === "company" ? "company" : "personal");
  const [form, setForm] = useState({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    companyName: initial?.companyName ?? "",
    cui: initial?.cui ?? "",
    regCom: initial?.regCom ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    county: initial?.county ?? "",
    zip: initial?.zip ?? "",
    country: initial?.country ?? "RO",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/user/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Datele nu au putut fi salvate.");
        return;
      }

      setSaved(true);
      setOpen(false);
    } catch {
      setError("Datele nu au putut fi salvate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <ReceiptText size={18} className="text-brand-600" aria-hidden />
        Date de facturare
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        Completeaza-le o singura data. Dupa fiecare plata primesti factura automat, pe email.
      </p>

      {!open ? (
        <div className="mt-4">
          {initial ? (
            <div className="rounded-lg border border-rule p-4 text-sm">
              <p className="font-medium">
                {initial.type === "company"
                  ? initial.companyName
                  : `${initial.firstName ?? ""} ${initial.lastName ?? ""}`.trim()}
              </p>
              {initial.cui && <p className="text-ink-soft">CUI {initial.cui}</p>}
              <p className="text-ink-soft">
                {initial.address}, {initial.city}
                {initial.county ? `, ${initial.county}` : ""}
              </p>
            </div>
          ) : null}

          {saved && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <Check size={15} aria-hidden />
              Salvat.
            </p>
          )}

          <button onClick={() => setOpen(true)} className="btn-ghost mt-4 w-full">
            Modifica datele
          </button>
        </div>
      ) : (
        <form onSubmit={save} className="mt-4 space-y-4">
          <div className="flex rounded-lg border border-rule p-0.5 text-sm">
            {(["personal", "company"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={cn(
                  "flex-1 rounded-md py-1.5 font-medium transition-colors",
                  type === value ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
                )}
              >
                {value === "personal" ? "Persoana fizica" : "Firma sau scoala"}
              </button>
            ))}
          </div>

          {type === "personal" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Prenume" value={form.firstName} onChange={set("firstName")} required />
              <Field label="Nume" value={form.lastName} onChange={set("lastName")} required />
            </div>
          ) : (
            <>
              <Field
                label="Denumire"
                value={form.companyName}
                onChange={set("companyName")}
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="CUI" value={form.cui} onChange={set("cui")} required />
                <Field label="Reg. Com." value={form.regCom} onChange={set("regCom")} />
              </div>
            </>
          )}

          <Field label="Adresa" value={form.address} onChange={set("address")} required />

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Localitate" value={form.city} onChange={set("city")} required />
            <Field label="Judet" value={form.county} onChange={set("county")} />
            <Field label="Cod postal" value={form.zip} onChange={set("zip")} />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
              Salveaza
            </button>
            {initial && (
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                Anuleaza
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <input className="input" value={value} onChange={onChange} required={required} />
    </label>
  );
}
