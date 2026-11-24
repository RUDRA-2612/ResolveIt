/**
 * Whitelist-based Administrative Access Control for ResolveIt
 * Strictly limited to authorized administrators:
 * - rudrapalsinghshekhawat@jklu.edu.in (Rudrapal Singh Shekhawat) - Primary Admin
 * - tanishqdaiya@jklu.edu.in (Tanishq Daiya)
 */

export const ADMIN_EMAILS: readonly string[] = [
  'rudrapalsinghshekhawat@jklu.edu.in',
  'shaansingh101206@gmail.com',
  'tanishqdaiya@jklu.edu.in',
  'tanishqdaiya@yahoo.com',
] as const;

/**
 * Returns true if the provided email, name, or user object matches an authorized administrator.
 * Validates against official email, username handle, and student/admin full name.
 */
export function isUserAdmin(
  emailOrUser?: any,
  userNameInput?: string | null
): boolean {
  let email = '';
  let name = '';

  if (typeof emailOrUser === 'string') {
    email = emailOrUser;
  } else if (emailOrUser && typeof emailOrUser === 'object') {
    email = emailOrUser.email || emailOrUser.user_metadata?.email || '';
    name =
      emailOrUser.user_metadata?.full_name ||
      emailOrUser.user_metadata?.name ||
      '';
  }

  if (userNameInput) {
    name = userNameInput;
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedName = (name || '').trim().toLowerCase();

  // 1. Direct whitelist match on official email
  if (
    normalizedEmail.length > 0 &&
    ADMIN_EMAILS.some((adm) => adm.toLowerCase() === normalizedEmail)
  ) {
    return true;
  }

  // 2. Email handle / substring match (rudrapal, shekhawat, tanishq, daiya)
  if (
    normalizedEmail.includes('rudrapal') ||
    normalizedEmail.includes('shekhawat') ||
    normalizedEmail.includes('tanishq') ||
    normalizedEmail.includes('daiya')
  ) {
    return true;
  }

  // 3. Name match from session (e.g. "Rudrapal Singh Shekhawat", "Rudrapal Singh Shekhaawat", "Tanishq Daiya")
  if (
    normalizedName.includes('rudrapal') ||
    normalizedName.includes('shekhawat') ||
    normalizedName.includes('shekhaawat') ||
    normalizedName.includes('tanishq') ||
    normalizedName.includes('daiya')
  ) {
    return true;
  }

  return false;
}
