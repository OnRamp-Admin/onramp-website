import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export default function PrivacyPolicyPage() {
  useSEO({
    title: 'Privacy Policy | OnRamp',
    description: 'OnRamp privacy policy. Learn how we collect, use, and protect your data.',
  });

  return (
    <div className="min-h-screen bg-carbon-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-6"
      >
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-carbon-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Privacy Policy</h1>
            <p className="text-carbon-400 text-sm">Last updated: March 11, 2026</p>
          </div>

          <p className="text-carbon-200">
            OnRamp Innovations, Inc. ("ONRAMP," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you use the
            ONRAMP application and related services.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>

            <h3 className="text-base font-semibold text-white">Account Information</h3>
            <p className="text-carbon-200">
              When you create an account, we collect your name, email address, phone number, and
              employer/service center information. If you sign in with Google, we receive your name
              and email from your Google profile.
            </p>

            <h3 className="text-base font-semibold text-white">Work Data</h3>
            <p className="text-carbon-200">
              As you use ONRAMP, we store job records including VIN numbers, repair order (RO) numbers,
              repair steps, time clock entries, and notes. Documents you upload (repair manuals, PDFs,
              technical service bulletins) are stored securely. <strong>Our AI is not trained on documents you upload.</strong> Uploaded
              documents are stored for your individual technician account only and are not shared between technicians,
              nor shared anywhere outside of that individual technician's account.
            </p>

            <h3 className="text-base font-semibold text-white">Voice Sessions</h3>
            <p className="text-carbon-200">
              When you use voice-guided repair assistance, audio is streamed in real-time to our AI
              providers for processing. <strong>Raw audio is not permanently stored.</strong> We retain
              session metadata (duration, token usage, timestamps) for service improvement and billing.
            </p>

            <h3 className="text-base font-semibold text-white">Usage Analytics</h3>
            <p className="text-carbon-200">
              We collect anonymized usage data through PostHog to understand how the app is used and
              improve the experience. This data does not include personally identifiable information.
            </p>

            <h3 className="text-base font-semibold text-white">Payment Information</h3>
            <p className="text-carbon-200">
              Payment processing is handled entirely by Stripe. We never receive, store, or process
              your full credit card number, CVV, or bank account details. We store only Stripe
              customer and subscription identifiers needed to manage your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1 text-carbon-200">
              <li>Provide and maintain the ONRAMP service, including voice-guided repair assistance</li>
              <li>Manage your account, service center membership, and team assignments</li>
              <li>Process payments and manage subscriptions</li>
              <li>Track work time and performance metrics for your shop</li>
              <li>Improve our AI models and service quality (using aggregated, non-identifiable data)</li>
              <li>Send transactional communications (account confirmation, password resets, invitations)</li>
              <li>Ensure security, detect fraud, and comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. How We Share Your Information</h2>
            <p className="text-carbon-200">
              We do not sell your personal information. We share data only with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-carbon-200">
              <li><strong>Your service center:</strong> Administrators and team leads at your shop can see your job records, time clock data, and performance metrics</li>
              <li><strong>Service providers:</strong> Third-party processors (Render, Google Cloud, Stripe, Deepgram, Resend, PostHog) that help us operate the service, each bound by data processing agreements</li>
              <li><strong>Legal requirements:</strong> When required by law, court order, or to protect our rights or the safety of others</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
            <p className="text-carbon-200">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-carbon-200">
              <li>AES-256 encryption at rest for all database and stored data</li>
              <li>TLS 1.2+ encryption for all data in transit</li>
              <li>Bcrypt password hashing (passwords are never stored in plaintext)</li>
              <li>Role-based access control with multi-tenant data isolation</li>
              <li>Rate limiting and input validation on all API endpoints</li>
              <li>Audit logging of all administrative actions</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-1 text-carbon-200">
              <li><strong>Account data:</strong> Retained until you delete your account</li>
              <li><strong>Job records and documents:</strong> Retained as configured by your service center</li>
              <li><strong>Voice audio:</strong> Processed in real-time; raw audio is not retained</li>
              <li><strong>Session metadata:</strong> Retained indefinitely for billing and service improvement</li>
              <li><strong>Audit logs:</strong> Retained for a minimum of one year</li>
              <li><strong>Payment data:</strong> Stripe identifiers retained until subscription cancellation</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>
            <p className="text-carbon-200">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-carbon-200">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of non-essential analytics</li>
            </ul>
            <p className="text-carbon-200">
              To exercise these rights, contact us at{" "}
              <a href="mailto:support@getonramp.io" className="text-electric-500 hover:underline">support@getonramp.io</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. California Privacy Rights (CCPA)</h2>
            <p className="text-carbon-200">
              If you are a California resident, you have additional rights under the California Consumer
              Privacy Act (CCPA), including the right to know what personal information we collect, the
              right to request deletion, and the right to opt out of the sale of personal information.
              <strong> We do not sell your personal information.</strong> To exercise your CCPA rights,
              contact us at{" "}
              <a href="mailto:support@getonramp.io" className="text-electric-500 hover:underline">support@getonramp.io</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Children's Privacy</h2>
            <p className="text-carbon-200">
              ONRAMP is not intended for use by anyone under 18 years of age. We do not knowingly
              collect personal information from minors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Changes to This Policy</h2>
            <p className="text-carbon-200">
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the updated policy in the app and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">10. Contact Us</h2>
            <p className="text-carbon-200">
              If you have questions about this Privacy Policy or our data practices, contact us at:{" "}
              <a href="mailto:support@getonramp.io" className="text-electric-500 hover:underline">support@getonramp.io</a>
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 text-sm text-carbon-400 pt-4 border-t border-carbon-800">
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </motion.div>
    </div>
  );
}
