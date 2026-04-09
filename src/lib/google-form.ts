/**
 * Google Form submission helper — shared across the marketing site so every
 * lead-capture surface (ContactPage, SignupModal, blog inline form) writes to
 * the same backing form with consistent field IDs.
 *
 * The `source` field labels where the lead came from so we can segment in PostHog
 * and the Google Sheet:
 *   - "Contact Form"           → ContactPage
 *   - "Pricing - {tier}"       → SignupModal
 *   - "Blog Post - {slug}"     → InlineBlogLeadForm
 */

const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSecRS6mfq1RZqVOEZ4KLTmogrF_4aSZ2fwg25YMO07ap88RmQ/formResponse';

const GOOGLE_FORM_FIELDS = {
  source: 'entry.1894016444',
  usageLevel: 'entry.1525145917',
  seats: 'entry.1446346906',
  name: 'entry.502216171',
  email: 'entry.1760694518',
  phone: 'entry.1441318369',
  shopName: 'entry.417059025',
  role: 'entry.2032741101',
  message: 'entry.1443923466',
} as const;

export interface GoogleFormSubmission {
  source: string;
  name: string;
  email: string;
  phone?: string;
  shopName?: string;
  role?: string;
  message?: string;
}

/**
 * Submit a lead to the shared Google Form. Uses no-cors mode so we can't read
 * the response, but the data still gets recorded. Returns true on success.
 */
export async function submitToGoogleForm(
  data: GoogleFormSubmission,
): Promise<boolean> {
  try {
    const formData = new URLSearchParams();
    formData.append(GOOGLE_FORM_FIELDS.source, data.source);
    formData.append(GOOGLE_FORM_FIELDS.name, data.name);
    formData.append(GOOGLE_FORM_FIELDS.email, data.email);
    if (data.phone) formData.append(GOOGLE_FORM_FIELDS.phone, data.phone);
    if (data.shopName) formData.append(GOOGLE_FORM_FIELDS.shopName, data.shopName);
    if (data.role) formData.append(GOOGLE_FORM_FIELDS.role, data.role);
    if (data.message) formData.append(GOOGLE_FORM_FIELDS.message, data.message);

    await fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    return true;
  } catch (err) {
    console.error('[google-form] submission error:', err);
    return false;
  }
}
