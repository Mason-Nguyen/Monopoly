const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactNumber(value: number): string {
  return compactNumberFormatter.format(value);
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (!value) {
    return "Unavailable";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return dateTimeFormatter.format(date);
}

export function formatEnumLabel(value: string | null | undefined): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .split("_")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}