import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="py-20 px-4 bg-carbon-950 border-t border-carbon-800/50">
      <div className="max-w-6xl mx-auto">
        {/* Footer Links */}
        <div className="grid md:grid-cols-4 gap-8 py-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/Onramp-Logo-Pink Brain-White Text-MED.png" alt="ONRAMP" className="h-10" />
            </Link>
            <p className="text-carbon-200 max-w-sm mb-6">
              Voice-first AI for service center technicians.
            </p>
            <div className="flex items-center gap-2 text-carbon-200 text-sm">
              <MapPin className="w-4 h-4" />
              <span>San Diego, California • Serving shops nationwide</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-carbon-200">
              <li>
                <Link to="/technicians" className="hover:text-electric-400 transition-colors">
                  For Technicians
                </Link>
              </li>
              <li>
                <Link to="/managers" className="hover:text-electric-400 transition-colors">
                  For Service Managers
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-electric-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-electric-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-electric-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/mobileapp" className="hover:text-electric-400 transition-colors">
                  ONRAMP Mobile Apps
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-carbon-200">
              <li>
                <Link to="/about" className="hover:text-electric-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-electric-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-electric-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-carbon-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-carbon-200 text-sm">
          <p>&copy; 2026 OnRamp Innovations, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-electric-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-electric-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
