import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Mic } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="py-20 px-4 bg-carbon-950 border-t border-carbon-800/50">
      <div className="max-w-6xl mx-auto">
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Let's Get Your Shop{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
              On The Ramp
            </span>
          </h2>
          <p className="text-carbon-400 text-lg max-w-xl mx-auto mb-8">
            See OnRamp in action with a personalized demo for your shop. No commitment, no pressure—just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:demo@onramp.ai"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 glow-electric"
            >
              <Mail className="w-5 h-5" />
              Request a Demo
            </a>
            <a
              href="tel:+18005551234"
              className="flex items-center gap-2 px-8 py-4 bg-carbon-800/50 hover:bg-carbon-700/50 text-carbon-100 font-semibold rounded-xl border border-carbon-600/50 hover:border-carbon-500/50 transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              Call Sales
            </a>
          </div>
        </motion.div>

        {/* Footer Links */}
        <div className="grid md:grid-cols-4 gap-8 py-12 border-t border-carbon-800/50">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-electric-500/20 to-safety-500/20 border border-electric-500/30">
                <Mic className="w-6 h-6 text-electric-400" />
              </div>
              <span className="text-2xl font-bold text-white">OnRamp</span>
            </div>
            <p className="text-carbon-400 max-w-sm mb-6">
              Voice-first AI for automotive technicians. Built for the shop floor, powered by Gemini AI.
            </p>
            <div className="flex items-center gap-2 text-carbon-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Detroit, MI • Serving shops nationwide</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-carbon-400">
              <li>
                <a href="#workflow" className="hover:text-electric-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#roi-calculator" className="hover:text-electric-400 transition-colors">
                  ROI Calculator
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-electric-400 transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-electric-400 transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-carbon-400">
              <li>
                <a href="#" className="hover:text-electric-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-electric-400 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-electric-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-electric-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-carbon-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-carbon-500 text-sm">
          <p>&copy; {new Date().getFullYear()} OnRamp AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-electric-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-electric-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
