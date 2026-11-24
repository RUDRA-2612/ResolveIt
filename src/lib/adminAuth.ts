/**
 * Whitelist-based Administrative Access Control for ResolveIt
 * Strictly limited to only two authorized institutional administrators:
 * 1. rudrapalsinghshekhawat@jklu.edu.in
 * 2. tanishqdaiya@jklu.edu.in
 */

export const ADMIN_EMAILS: readonly string[] = [
  'rudrapalsinghshekhawat@jklu.edu.in',
  'tanishqdaiya@jklu.edu.in',
] as const;

/**
 * Returns true strictly if the user's email matches one of the two authorized emails.
 */
export function isUserAdmin(
  emailOrUser?: any,
  _userNameInput?: string | null
): boolean {
  let email = '';

  if (typeof emailOrUser === 'string') {
    email = emailOrUser;
  } else if (emailOrUser && typeof emailOrUser === 'object') {
    email = emailOrUser.email || emailOrUser.user_metadata?.email || '';
  }

  const normalizedEmail = (email || '').trim().toLowerCase();

  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === normalizedEmail);
}

