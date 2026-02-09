/**
 * Shared input validation helpers for customer-facing forms.
 */

/** Strip everything except digits from a string. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Format a US phone number as user types.
 * Accepts digits, formats as (555) 555-5555.
 */
export function formatPhone(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6)
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Validate a US phone number (must be exactly 10 digits).
 * Returns an error message or null if valid.
 */
export function validatePhone(value: string): string | null {
  if (!value) return null; // Allow empty (optional field)
  const digits = digitsOnly(value);
  if (digits.length !== 10) return "Please enter a 10-digit US phone number";
  return null;
}

/**
 * Validate a US phone number that is required.
 */
export function validatePhoneRequired(value: string): string | null {
  if (!value.trim()) return "Phone number is required";
  const digits = digitsOnly(value);
  if (digits.length !== 10) return "Please enter a 10-digit US phone number";
  return null;
}

/**
 * Format a US ZIP code as user types.
 * Accepts 5 digits or 5+4 (ZIP+4) format.
 */
export function formatZip(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
}

/**
 * Validate a US ZIP code (5 digits or ZIP+4).
 */
export function validateZip(value: string): string | null {
  if (!value.trim()) return "ZIP code is required";
  const digits = digitsOnly(value);
  if (digits.length !== 5 && digits.length !== 9)
    return "Enter a 5-digit ZIP code";
  return null;
}

/**
 * Validate an email address (basic format check).
 */
export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
    return "Please enter a valid email address";
  return null;
}

/**
 * Validate a name field (non-empty, reasonable length).
 */
export function validateName(value: string, label = "This field"): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required`;
  if (trimmed.length > 100) return `${label} is too long`;
  return null;
}
