/**
 * Facturare prin Oblio.
 *
 * Emiterea se face automat, din webhookul Stripe, imediat dupa ce plata a fost
 * confirmata. Daca emiterea esueaza, plata ramane valida si creditele sunt deja
 * adaugate: factura se poate relua manual din panoul de administrare.
 */

const AUTH_URL = "https://www.oblio.eu/api/authorize/token";
const INVOICE_URL = "https://www.oblio.eu/api/docs/invoice";

export type InvoiceClient = {
  name: string;
  /** CUI, doar pentru firme si institutii. */
  cif?: string;
  /** Numar din registrul comertului. */
  rc?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  email?: string;
};

export type InvoiceLine = {
  name: string;
  price: number;
  quantity: number;
};

export type IssuedInvoice = {
  seriesName: string;
  number: string;
  link: string | null;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function config() {
  return {
    cif: process.env.OBLIO_CIF_FIRMA ?? "",
    clientId: process.env.OBLIO_CLIENT_ID ?? "",
    clientSecret: process.env.OBLIO_CLIENT_SECRET ?? "",
    series: process.env.OBLIO_SERIE_FACTURA ?? "",
  };
}

export function oblioConfigured() {
  const { cif, clientId, clientSecret, series } = config();
  return Boolean(cif && clientId && clientSecret && series);
}

/** Tokenul Oblio este valabil o ora; il tinem in memorie pana aproape de expirare. */
async function getToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const { cif, clientId, clientSecret } = config();
  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cif, client_id: clientId, client_secret: clientSecret }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Autentificarea Oblio a esuat: ${response.status}`);
  }

  const data = await response.json();
  const expiresIn = Number(data.expires_in ?? 3600);
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000 - 60_000,
  };

  return cachedToken.value;
}

/** Ziua calendaristica din Romania (in UTC, intre 00:00 si 03:00 ar iesi ziua precedenta). */
function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(new Date());
}

/**
 * Cota de TVA setata implicit pentru firma in Oblio (firma nu este platitoare de TVA),
 * ca facturile sa urmeze configurarea din Oblio, la fel ca pe celelalte platforme.
 */
let cachedVat: string | null | undefined;
async function defaultVatName(token: string, cif: string) {
  if (cachedVat !== undefined) return cachedVat;
  try {
    const response = await fetch(`https://www.oblio.eu/api/nomenclature/vat_rates?cif=${encodeURIComponent(cif)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await response.json();
    const rates: { name: string; default?: boolean }[] = data?.data ?? [];
    cachedVat = (rates.find((r) => r.default) ?? rates[0])?.name ?? null;
  } catch (error) {
    console.error("[oblio] cote TVA:", error);
    cachedVat = null;
  }
  return cachedVat;
}

/** Emite o factura, cu cota de TVA implicita a firmei din Oblio. */
export async function createInvoice(
  client: InvoiceClient,
  lines: InvoiceLine[],
  currency = "RON"
): Promise<IssuedInvoice> {
  if (!oblioConfigured()) {
    throw new Error("Oblio nu este configurat (lipsesc variabilele OBLIO_*).");
  }

  const token = await getToken();
  const { cif, series } = config();
  const vatName = await defaultVatName(token, cif);

  const response = await fetch(INVOICE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      cif,
      client: { ...client, save: true },
      issueDate: today(),
      dueDate: today(),
      seriesName: series,
      language: "RO",
      precision: 2,
      useStock: false,
      products: lines.map((line) => ({
        name: line.name,
        price: line.price,
        quantity: line.quantity,
        measuringUnitName: "buc",
        currency,
        productType: "Serviciu",
        ...(vatName ? { vatName } : {}),
        vatIncluded: true,
      })),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Emiterea facturii a esuat: ${response.status} ${JSON.stringify(data?.statusMessage ?? data)}`
    );
  }

  return {
    seriesName: data.data?.seriesName ?? series,
    number: String(data.data?.number ?? ""),
    link: data.data?.link ?? null,
  };
}
