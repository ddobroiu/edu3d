import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY lipseste din environment.");
    client = new Stripe(key, { apiVersion: "2025-12-15.clover" as Stripe.LatestApiVersion });
  }
  return client;
}

export function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://edu3d.ro";
}
