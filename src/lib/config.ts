/** Brand-wide configuration for the Asasi storefront. */
export const BRAND = {
  name: "Asasi",
  tagline: "Organic skincare made for real skin, real routines, and a natural glow.",
  shortTagline: "All-organic skincare",
  // WhatsApp number in international format without "+" for wa.me links.
  whatsapp: "923001234567",
  whatsappDisplay: "+92 300 1234567",
  email: "hello@asasi.pk",
  instagram: "asasi.skin",
  // Fulfilment
  courier: "TCS",
  established: "Handmade in small batches",
} as const;

export const PAYMENT_METHODS = [
  {
    value: "cod",
    label: "Cash on Delivery",
    hint: "Pay in cash when your TCS parcel arrives.",
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    hint: "Transfer to our account, then send the payment screenshot on WhatsApp.",
  },
  {
    value: "online",
    label: "Online Payment (JazzCash / Easypaisa)",
    hint: "Pay to our wallet, then send the payment screenshot on WhatsApp.",
  },
] as const;

/** Methods that require the customer to send proof and admin to approve. */
export const PROOF_METHODS = ["online", "bank_transfer"] as const;

export const ORDER_STATUSES = [
  "awaiting_payment",
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

/**
 * Bank / wallet details shown to customers paying by bank transfer or online.
 * TODO(owner): replace these placeholders with the real account details.
 */
export const BANK_DETAILS = {
  bankName: "Meezan Bank",
  accountTitle: "Asasi Organics",
  accountNumber: "0000 0000 0000 00",
  iban: "PK00 MEZN 0000 0000 0000 0000",
  jazzcash: "0300 1234567",
  easypaisa: "0300 1234567",
};

/** WhatsApp number to which customers send their payment screenshot. */
export const PAYMENT_WHATSAPP = BRAND.whatsapp;
export const PAYMENT_WHATSAPP_DISPLAY = BRAND.whatsappDisplay;

/** WhatsApp deep link with an optional pre-filled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${BRAND.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
