export function toPhoneInputValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const phone = value.trim();
  if (!phone) return undefined;
  if (phone.startsWith("+")) return phone;

  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("0062")) return `+${digits.slice(2)}`;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  return `+62${digits}`;
}
