import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format phone number to xxx-xxx-xxxx format
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  // Thai mobile: 0xx-xxx-xxxx (10 digits)
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Thai landline: 0x-xxx-xxxx (9 digits)
  if (digits.length === 9 && digits.startsWith("0")) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }

  return phone;
}

/**
 * Get clean phone number for tel: link
 */
export function getPhoneLink(phone: string): string {
  return phone.replace(/\D/g, "");
}
