import dns from 'dns';

/**
 * Validates email syntax, blocks disposable temporary email services,
 * and performs a live DNS MX record lookup to ensure the domain is active and can receive emails.
 */
export async function validateWorkingEmail(email: string): Promise<{ valid: boolean; error?: string }> {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required' };
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Email Syntax & Format Validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, error: 'Please enter a valid email address (e.g., student@domain.com).' };
  }

  const domain = cleanEmail.split('@')[1];

  // 2. Block Known Disposable / Temporary / Fake Email Domains
  const disposableDomains = [
    'mailinator.com',
    '10minutemail.com',
    'tempmail.com',
    'yopmail.com',
    'guerrillamail.com',
    'dispostable.com',
    'trashmail.com',
    'fakeinbox.com',
    'getnada.com',
    'sharklasers.com',
    'throwawaymail.com',
    'temp-mail.org',
    'crazymailing.com',
    'maildrop.cc',
    'tempmail.net',
    'mytemp.email',
    'binkmail.com',
    'safetymail.info',
    'guerrillamailblock.com',
  ];

  if (disposableDomains.includes(domain)) {
    return {
      valid: false,
      error: 'Temporary or disposable email addresses are not permitted. Please use a valid, permanent email address.',
    };
  }

  // 3. DNS MX Record Lookup — Verify domain has live, active mail servers
  try {
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        error: `The email domain "${domain}" has no active mail servers (MX records). Please provide a working email address.`,
      };
    }
  } catch (err: any) {
    // ENOTFOUND / ENODATA means domain does not exist or cannot handle email
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'EREFUSED') {
      return {
        valid: false,
        error: `The email domain "${domain}" does not exist or cannot receive emails. Please enter a live, working email address.`,
      };
    }
    // If DNS check fails due to local network timeout, log warning & allow standard valid domains
    console.warn(`DNS MX check skipped for domain ${domain}:`, err.message);
  }

  return { valid: true };
}
