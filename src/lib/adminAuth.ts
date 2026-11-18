/**
 * Whitelist-based Administrative Access Control for ResolveIt
 * Strictly limited to authorized administrators.
 */

export const ADMIN_EMAILS: readonly string[] = [
  'rudrapalsinghshekhawat@jklu.edu.in',
  'rudra@jklu.edu.in',
  'tanishqdaiya@jklu.edu.in',
  'tanishq@jklu.edu.in',
] as const;

/**
 * Returns true if the provided email matches one of the authorized admin emails.
 * Case-insensitive comparison.
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

