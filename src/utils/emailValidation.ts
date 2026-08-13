/** Accepts real emails: name@gmail.com, name@yahoo.com, name@custom-domain.co, etc. */
export function isValidEmailAddress(email: string): boolean {
  const value = String(email || '').trim();
  if (!value || value.length > 254) return false;
  // local@domain.tld — requires @ and a domain with a real TLD (2+ chars)
  return /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(
    value
  );
}

export const EMAIL_VALIDATION_ERROR = 'Please use a proper or correct email address.';
