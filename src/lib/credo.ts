// Credo has two completely separate environments (different accounts + keys).
// Sandbox keys start with 0PUB / live keys start with 1PUB.
const isLive = process.env.NEXT_PUBLIC_CREDO_ENV === "live";

export const IS_SANDBOX = !isLive;

export const CREDO_SCRIPT_URL = isLive
  ? "https://pay.credocentral.com/inline.js"
  : "https://pay.credodemo.com/inline.js";

export const CREDO_API_URL = isLive
  ? "https://api.credocentral.com"
  : "https://api.credodemo.com";

// Alphanumeric only — Credo rejects anything else.
export const newReference = () => `DEMO${Date.now()}${Math.floor(Math.random() * 1000)}`;

// Your own order data travels with the payment as Credo "custom fields".
export const toCredoMetadata = (data: Record<string, string | number>) => ({
  customFields: Object.entries(data).map(([key, value]) => ({
    variable_name: key,
    value: String(value),
    display_name: key[0].toUpperCase() + key.slice(1),
  })),
});
