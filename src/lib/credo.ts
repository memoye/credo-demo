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
