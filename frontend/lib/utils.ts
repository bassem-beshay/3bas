import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string | undefined | null, currency: string = "EGP"): string {
  if (amount === undefined || amount === null) return `0 ${currency}`;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `0 ${currency}`;
  
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}
