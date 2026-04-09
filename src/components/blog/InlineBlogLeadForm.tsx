/**
 * InlineBlogLeadForm — minimal 3-field lead capture (Name + Email + Role) that
 * appears at the bottom of every blog post in place of the old "See How It
 * Works" CTA box. Submits to the same Google Form pipeline as ContactPage and
 * SignupModal, with `source = "Blog Post - {slug}"` so the lead is attributable
 * to the originating post in the spreadsheet and in PostHog.
 *
 * Fires two PostHog events on success:
 *  - `contact_form_submitted` (existing event) — populates the
 *    🔥 Blog → Signup modal → Form funnel without any dashboard changes
 *  - `blog_lead_captured` (new) — slug + role for finer-grained reporting later
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { submitToGoogleForm } from '../../lib/google-form';
import {
  trackContactFormSubmit,
  trackBlogLeadCaptured,
} from '../../lib/analytics';
import { trackConversion } from '../../lib/marketing-pixels';

interface InlineBlogLeadFormProps {
  slug: string;
}

const ROLES = [
  'Technician',
  'Service Manager',
  'Shop Owner',
  'Other',
] as const;

// Same input styling used on ContactPage so the form feels native to the site.
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-carbon-900/80 border border-carbon-700/50 text-white placeholder-carbon-500 focus:border-electric-500/50 focus:outline-none focus:ring-1 focus:ring-electric-500/30 transition-colors';

function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return pattern.test(email);
}

export default function InlineBlogLeadForm({ slug }: InlineBlogLeadFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!role) {
      setError('Please choose your role.');
      return;
    }

    setSubmitting(true);

    // Fire analytics first so they land even if the network call slows down.
    // The existing `contact_form_submitted` event powers the Blog → Signup
    // funnel tile in PostHog dashboard 1446007 — no dashboard edit needed.
    trackContactFormSubmit({
      role,
      hasPhone: false,
      hasShopName: false,
    });
    trackBlogLeadCaptured({ slug, role });
    trackConversion('lead');

    await submitToGoogleForm({
      source: `Blog Post - ${slug}`,
      name: name.trim(),
      email: email.trim(),
      role,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-16 p-8 rounded-2xl bg-carbon-800/60 border border-green-500/30 text-center"
      >
        <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-white font-bold text-xl mb-2">Thanks — we'll be in touch!</h3>
        <p className="text-carbon-200">
          We'll reach out within 24 hours with more on how ONRAMP could fit your shop.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16 p-8 rounded-2xl bg-carbon-800/50 border border-carbon-700/50"
    >
      <h2 className="text-2xl font-bold text-white mb-2">
        Want to learn more about ONRAMP?
      </h2>
      <p className="text-carbon-200 mb-6">
        Drop your details and we'll get back to you with a personalized walkthrough.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-carbon-200 text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-carbon-200 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-carbon-200 text-sm font-medium mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select your role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric-500 hover:bg-electric-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Sending…' : 'Get in touch'}
        </button>
      </form>
    </motion.div>
  );
}
