function parseCalendarDate(value: string | Date | null | undefined): Date | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (!value) return null;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export const MAX_APPLICANT_AGE = 17;

function getJakartaCalendarDate(value: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Returns completed calendar years, or null when the input is invalid or in the future. */
export function calculateAgeInYears(
  birthDateValue: string | Date | null | undefined,
  referenceDate = new Date()
): number | null {
  const birthDate = parseCalendarDate(birthDateValue);
  if (!birthDate || Number.isNaN(referenceDate.getTime())) return null;

  const today = getJakartaCalendarDate(referenceDate);
  if (birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasNotOccurred =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

  if (birthdayHasNotOccurred) age -= 1;
  return age;
}
