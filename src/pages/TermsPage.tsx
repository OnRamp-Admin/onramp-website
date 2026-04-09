import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export default function TermsPage() {
  useSEO({
    title: 'Terms of Service | OnRamp',
    description: 'OnRamp terms of service. Review the terms governing your use of the OnRamp platform.',
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
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Terms of Service</h1>
            <p className="text-carbon-400 text-sm">Last updated: March 11, 2026</p>
          </div>

          <p className="text-carbon-200">
            These Terms of Service ("Terms") govern your use of the ONRAMP application and related
            services provided by OnRamp Innovations, Inc. ("ONRAMP," "we," "our," or "us"). By using ONRAMP, you agree to
            these Terms.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Service Description</h2>
            <p className="text-carbon-200">
              ONRAMP is an AI-powered platform for automotive technicians that provides voice-guided
              repair assistance, job management, document processing, time tracking, and performance
              analytics. The service is intended for use by professional automotive service centers
              and their employees.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Accounts</h2>
            <p className="text-carbon-200">
              You must create an account to use ONRAMP. You are responsible for maintaining the
              confidentiality of your account credentials and for all activity under your account.
              You must provide accurate information and keep it up to date.
            </p>
            <p className="text-carbon-200">
              Service center administrators may invite team members and manage access within their
              organization. Administrators are responsible for managing their team's access appropriately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Acceptable Use</h2>
            <p className="text-carbon-200">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-carbon-200">
              <li>Use ONRAMP for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to other accounts or our systems</li>
              <li>Reverse engineer, decompile, or disassemble the application</li>
              <li>Upload malicious files or content</li>
              <li>Use the service to store or transmit content that infringes intellectual property rights</li>
              <li>Interfere with the service's operation or other users' experience</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. AI-Generated Content</h2>
            <p className="text-carbon-200">
              ONRAMP uses artificial intelligence to provide repair guidance, document extraction,
              and voice assistance. While we strive for accuracy, AI-generated content is provided
              as a reference aid and does not replace professional judgment.
            </p>
            <p className="text-carbon-200">
              <strong>Important:</strong> Technicians should always verify AI-provided repair steps
              against OEM documentation and use their professional expertise. ONRAMP is a tool to
              assist — not replace — qualified automotive technicians. <strong>Technicians are ultimately
              responsible for all decisions, actions, and outcomes that occur during every job they perform.</strong> Use
              of ONRAMP does not transfer or diminish that responsibility in any way.
            </p>

            <h3 className="text-base font-semibold text-white">AI-Assisted Diagnosis</h3>
            <p className="text-carbon-200">
              ONRAMP's AI diagnosis feature cross-references symptoms against known failures, technical
              service bulletins (TSBs), and common causes to help technicians identify potential root causes.
              <strong> AI-assisted diagnosis is provided as a reference aid only and does not constitute a
              definitive diagnosis.</strong> OnRamp Innovations, Inc. is not responsible for any vehicle damage,
              personal injury, or other losses resulting from reliance on AI-generated diagnostic suggestions.
              Technicians must exercise their own professional judgment and follow established diagnostic
              procedures. The AI may suggest incorrect or incomplete diagnoses — always verify findings
              through proper testing and OEM-recommended diagnostic processes before performing repairs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Subscriptions & Payments</h2>
            <p className="text-carbon-200">
              Access to ONRAMP may require a paid subscription. Subscriptions are billed through
              Stripe. By subscribing, you authorize us to charge your payment method on a recurring
              basis. You may cancel your subscription at any time through your account settings or
              the Stripe customer portal.
            </p>
            <p className="text-carbon-200">
              We reserve the right to change pricing with 30 days' notice. Price changes will not
              affect your current billing period.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Your Data</h2>
            <p className="text-carbon-200">
              You retain ownership of the data you create and upload to ONRAMP, including job records,
              documents, and notes. We do not claim ownership of your content. Our use of your data
              is governed by our <Link to="/privacy" className="text-electric-500 hover:underline">Privacy Policy</Link>.
            </p>
            <p className="text-carbon-200">
              You are responsible for maintaining your own backups of critical data. While we implement
              robust data protection measures, we recommend keeping copies of important documents
              outside of ONRAMP.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Service Availability</h2>
            <p className="text-carbon-200">
              We strive to maintain high availability but do not guarantee uninterrupted service.
              ONRAMP may be temporarily unavailable for maintenance, updates, or due to factors
              beyond our control. We will make reasonable efforts to notify users of planned downtime.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Limitation of Liability</h2>
            <p className="text-carbon-200">
              To the maximum extent permitted by law, OnRamp Innovations, Inc. and its officers, employees, and
              partners shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages resulting from your use of the service, including but not limited
              to damages arising from reliance on AI-generated diagnostic suggestions, repair guidance,
              procedure recommendations, or any other AI-produced content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Termination</h2>
            <p className="text-carbon-200">
              We may suspend or terminate your account if you violate these Terms or for any other
              reason with reasonable notice. You may delete your account at any time by contacting
              us. Upon termination, your right to use the service ceases immediately, though we
              will retain data as described in our Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">10. Changes to Terms</h2>
            <p className="text-carbon-200">
              We may update these Terms from time to time. We will notify you of material changes
              by posting the updated terms in the app and updating the "Last updated" date. Continued
              use after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">11. Governing Law</h2>
            <p className="text-carbon-200">
              These Terms are governed by the laws of the State of California, without regard to
              conflict of law principles. Any disputes shall be resolved in the courts located in
              California.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">12. Contact</h2>
            <p className="text-carbon-200">
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:support@getonramp.io" className="text-electric-500 hover:underline">support@getonramp.io</a>
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 text-sm text-carbon-400 pt-4 border-t border-carbon-800">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </motion.div>
    </div>
  );
}
