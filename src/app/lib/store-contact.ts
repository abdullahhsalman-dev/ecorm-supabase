/*
 * ---------------------------------------------------------
 * STORE CONTACT DETAILS
 * ---------------------------------------------------------
 *
 * One place for how customers reach the shop, because the
 * footer, the contact page and the WhatsApp button all need
 * the same number and must never disagree.
 *
 * The values come from NEXT_PUBLIC_* environment variables so
 * they can differ between a staging shop and the real one.
 * The fallbacks are the placeholders the footer already
 * carried - replace them in .env before launch, or customers
 * will message a number that is not yours.
 */

/* Digits only, with country code and no '+' - what wa.me expects. */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923001234567";

export const STORE_PHONE =
  process.env.NEXT_PUBLIC_STORE_PHONE ?? "+92 300 123 4567";

export const STORE_EMAIL =
  process.env.NEXT_PUBLIC_STORE_EMAIL ?? "support@lamees.com";

export const STORE_ADDRESS =
  process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "Karachi, Sindh, Pakistan";

export const STORE_HOURS = "Monday to Saturday, 10am - 8pm (PKT)";

/**
 * A wa.me link, optionally opening the chat with a message
 * already typed.
 *
 * wa.me works on desktop and mobile and needs no app id, which
 * is why it is used here rather than the api.whatsapp.com form.
 */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;

  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/* Digits only, so the number can also be dialled. */
export const telHref = `tel:${STORE_PHONE.replace(/[^\d+]/g, "")}`;

export const mailtoHref = `mailto:${STORE_EMAIL}`;
