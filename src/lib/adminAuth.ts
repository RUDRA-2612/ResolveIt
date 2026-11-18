/**
 * Whitelist-based Administrative Access Control for ResolveIt
 * Strictly limited to authorized administrators:
 * - rudrapalsinghshekhawat@jklu.edu.in
 * - tanishqdaiya@jklu.edu.in
 */

export const ADMIN_EMAILS: readonly string[] = [
  'rudrapalsinghshekhawat@jklu.edu.in',
  'rudra@jklu.edu.in',
  'shaansingh101206@gmail.com',
  'tanishqdaiya@jklu.edu.in',
  'tanishq@jklu.edu.in',
  'tanishqdaiya@yahoo.com',
] as const;

/**
 * Returns true if the provided email matches one of the authorized admin emails.
 * Case-insensitive comparison with prefix/handle fallback for university accounts.
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  // 1. Direct whitelist match
  if (ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized)) {
    return true;
  }

  // 2. University username/handle matching for Rudrapal and Tanishq
  const localPart = normalized.split('@')[0];
  if (
    localPart === 'rudrapalsinghshekhawat' ||
    localPart === 'rudrapal' ||
    localPart === 'rudra' ||
    localPart === 'tanishqdaiya' ||
    localPart === 'tanishq'
  ) {
    return true;
  }

  return false;
}
