import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shopName: '',
    role: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire up to actual form submission (e.g., Formspree, email API)
    setSubmitted(true);
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 carbon-fiber-bg overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-electric-500/15 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Let's Get Your Shop{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
              On The Ramp
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-carbon-300 max-w-3xl mx-auto"
          >
            Have questions? Want a demo? Drop us a line and we'll get back to you fast.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-carbon-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Contact Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
                  <p className="text-carbon-400">
                    Whether you're a solo tech or running a 20-bay department, we'd love to hear from you.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-electric-500/10">
                      <Phone className="w-5 h-5 text-electric-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Phone</h3>
                      <a href="tel:+18005551234" className="text-carbon-300 hover:text-electric-400 transition-colors">
                        (800) 555-1234
                      </a>
                      <p className="text-carbon-500 text-sm mt-1">Mon-Fri, 8am-6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-electric-500/10">
                      <Mail className="w-5 h-5 text-electric-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Email</h3>
                      <a href="mailto:hello@getonramp.io" className="text-carbon-300 hover:text-electric-400 transition-colors">
                        hello@getonramp.io
                      </a>
                      <p className="text-carbon-500 text-sm mt-1">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-electric-500/10">
                      <MapPin className="w-5 h-5 text-electric-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Location</h3>
                      <p className="text-carbon-300">Detroit, MI</p>
                      <p className="text-carbon-500 text-sm mt-1">Serving shops nationwide</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              {submitted ? (
                <div className="p-8 md:p-12 rounded-2xl bg-carbon-800/60 border border-green-500/30 text-center">
                  <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-4">Message Sent</h3>
                  <p className="text-carbon-300 text-lg">
                    Thanks for reaching out! We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-carbon-200 text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-carbon-900/80 border border-carbon-700/50 text-white placeholder-carbon-500 focus:border-electric-500/50 focus:outline-none focus:ring-1 focus:ring-electric-500/30 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-carbon-200 text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-carbon-900/80 border border-carbon-700/50 text-white placeholder-carbon-500 focus:border-electric-500/50 focus:outline-none focus:ring-1 focus:ring-electric-500/30 transition-colors"
                        placeholder="you@shop.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-carbon-200 text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-carbon-900/80 border border-carbon-700/50 text-white placeholder-carbon-500 focus:border-electric-500/50 focus:outline-none focus:ring-1 focus:ring-electric-500/30 transition-colors"
                        placeholder="(555) 555-5555"
                      />
                    </div>
                    <div>
                      <label className="block text-carbon-200 text-sm font-medium mb-2">Shop Name</label>
                      <input
                        type="text"
                        value={formData.shopName}
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-carbon-900/80 border border-carbon-700/50 text-white placeholder-carbon-500 focus:border-electric-500/50 focus:outline-none focus:ring-1 focus:ring-electric-500/30 transition-colors"
                        placeholder="Your shop or dealership"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-carbon-200 text-sm font-medium mb-2">I am a...</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-carbon-900/80 border border-carbon-700/50 text-white focus:border-electric-500/50 focus:outline-none focus:ring-1 focus:ring-electric-500/30 transition-colors"
                    >
                      <option value="" className="bg-carbon-900">Select your role</option>
                      <option value="technician" className="bg-carbon-900">Technician</option>
                      <option value="service-manager" className="bg-carbon-900">Service Manager</option>
                      <option value="shop-owner" className="bg-carbon-900">Shop Owner</option>
                      <option value="other" className="bg-carbon-900">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-carbon-200 text-sm font-medium mb-2">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-carbon-900/80 border border-carbon-700/50 text-white placeholder-carbon-500 focus:border-electric-500/50 focus:outline-none focus:ring-1 focus:ring-electric-500/30 transition-colors resize-none"
                      placeholder="Tell us about your shop and what you're looking for..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="group w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-semibold rounded-xl transition-all duration-300 glow-electric"
                  >
                    Send Message
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
