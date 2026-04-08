import { motion } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import { useState, useEffect, useRef } from 'react';
import { Mail, MapPin, CheckCircle2, Building2, X, Search } from 'lucide-react';
import { trackContactFormSubmit } from '../lib/analytics';
import { trackConversion } from '../lib/marketing-pixels';

// ─── Google Form Configuration ───────────────────────────────────────────────
const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSecRS6mfq1RZqVOEZ4KLTmogrF_4aSZ2fwg25YMO07ap88RmQ/formResponse';
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
};

// ─── Phone Formatting ────────────────────────────────────────────────────────
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function getPhoneDigits(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

// ─── Email Validation ────────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  // Basic format check
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!pattern.test(email)) return false;
  // Reject obvious typos
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  const suspiciousTLDs = ['con', 'cmo', 'cim', 'coom'];
  const tld = domain.split('.').pop() || '';
  if (suspiciousTLDs.includes(tld)) return false;
  return true;
}

// ─── Google Places Types ─────────────────────────────────────────────────────
interface PlaceSuggestion {
  name: string;
  formattedAddress: string;
  placeId?: string;
}

// ─── Google Forms Submission ─────────────────────────────────────────────────
async function submitToGoogleForm(data: {
  name: string;
  email: string;
  phone: string;
  shopName: string;
  role: string;
  message: string;
}): Promise<boolean> {
  try {
    const formData = new URLSearchParams();
    formData.append(GOOGLE_FORM_FIELDS.source, 'Contact Form');
    formData.append(GOOGLE_FORM_FIELDS.name, data.name);
    formData.append(GOOGLE_FORM_FIELDS.email, data.email);
    formData.append(GOOGLE_FORM_FIELDS.phone, data.phone);
    formData.append(GOOGLE_FORM_FIELDS.shopName, data.shopName);
    formData.append(GOOGLE_FORM_FIELDS.role, data.role);
    formData.append(GOOGLE_FORM_FIELDS.message, data.message);

    // Google Forms doesn't return CORS-friendly responses, so we use no-cors mode.
    // This means we can't read the response, but the data still gets submitted.
    await fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    return true;
  } catch (err) {
    console.error('[ContactForm] Google Form submission error:', err);
    return false;
  }
}

// ─── Google Places Autocomplete ──────────────────────────────────────────────
const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

async function searchPlaces(
  query: string,
  location: { lat: number; lng: number } | null,
): Promise<PlaceSuggestion[]> {
  if (!PLACES_API_KEY || query.length < 3) return [];

  try {
    const body: Record<string, unknown> = {
      input: query,
      includedPrimaryTypes: ['car_dealer', 'car_repair'],
    };

    if (location) {
      body.locationBias = {
        circle: {
          center: { latitude: location.lat, longitude: location.lng },
          radius: 50000.0,
        },
      };
    }

    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': PLACES_API_KEY,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) return [];
    const data = await response.json();

    const suggestions: PlaceSuggestion[] = (data.suggestions || []).map(
      (s: any) => ({
        name: s.placePrediction?.structuredFormat?.mainText?.text || '',
        formattedAddress:
          s.placePrediction?.structuredFormat?.secondaryText?.text || '',
        placeId: s.placePrediction?.placeId,
      }),
    );

    // Enrich with full addresses (includes street numbers)
    const enriched = await Promise.all(
      suggestions.map(async (place) => {
        if (!place.placeId) return place;
        try {
          const detailsRes = await fetch(
            `https://places.googleapis.com/v1/places/${place.placeId}?fields=displayName,formattedAddress`,
            {
              headers: {
                'X-Goog-Api-Key': PLACES_API_KEY,
                'X-Goog-FieldMask': 'displayName,formattedAddress',
              },
            },
          );
          if (detailsRes.ok) {
            const details = await detailsRes.json();
            return {
              ...place,
              formattedAddress: details.formattedAddress || place.formattedAddress,
            };
          }
        } catch { /* keep original */ }
        return place;
      }),
    );

    // Sort: prioritize shops with "service" in name
    return enriched.sort((a, b) => {
      const aService = a.name.toLowerCase().includes('service');
      const bService = b.name.toLowerCase().includes('service');
      if (aService && !bService) return -1;
      if (!aService && bService) return 1;
      return 0;
    });
  } catch (err) {
    console.error('[Places] Search error:', err);
    return [];
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shopName: '',
    shopAddress: '',
    role: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Places autocomplete state
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shopSelected, setShopSelected] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isSelectingRef = useRef(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { /* continue without location */ },
      );
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced Places search
  useEffect(() => {
    if (isSelectingRef.current) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (formData.shopName.length >= 3 && !shopSelected) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchPlaces(formData.shopName, userLocation);
        if (!isSelectingRef.current) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [formData.shopName, userLocation, shopSelected]);

  const selectPlace = (place: PlaceSuggestion) => {
    isSelectingRef.current = true;
    setFormData((prev) => ({
      ...prev,
      shopName: place.name,
      shopAddress: place.formattedAddress,
    }));
    setShopSelected(true);
    setShowSuggestions(false);
    setErrors((prev) => ({ ...prev, shopName: '' }));
    setTimeout(() => { isSelectingRef.current = false; }, 500);
  };

  const clearShopSelection = () => {
    setFormData((prev) => ({ ...prev, shopName: '', shopAddress: '' }));
    setShopSelected(false);
    setSuggestions([]);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneDigits = getPhoneDigits(formData.phone);
    if (formData.phone && phoneDigits.length > 0 && phoneDigits.length < 10) {
      newErrors.phone = 'Please enter a full 10-digit phone number';
    }

    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    // Build the shop name value for the form — include address if a place was selected
    const shopNameValue = shopSelected && formData.shopAddress
      ? `${formData.shopName} — ${formData.shopAddress}`
      : formData.shopName;

    // Fire tracking events (don't block on these)
    trackContactFormSubmit({
      role: formData.role,
      hasPhone: !!formData.phone,
      hasShopName: !!formData.shopName,
    });
    trackConversion('lead');

    // Submit to Google Forms
    await submitToGoogleForm({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      shopName: shopNameValue,
      role: formData.role,
      message: formData.message,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  const inputClasses =
    'w-full px-4 py-3 rounded-xl bg-carbon-900/80 border border-carbon-700/50 text-white placeholder-carbon-500 focus:border-electric-500/50 focus:outline-none focus:ring-1 focus:ring-electric-500/30 transition-colors';
  const errorInputClasses =
    'w-full px-4 py-3 rounded-xl bg-carbon-900/80 border border-red-500/50 text-white placeholder-carbon-500 focus:border-red-400/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-colors';

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
            Questions? Demo?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">
              Let's Talk!
            </span>
          </motion.h1>
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
                viewport={mobileViewport}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Get in Touch with <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">ONRAMP</span></h2>
                  <p className="text-carbon-200">
                    Whether you're a solo technician or running a 5-shop operation with 50 techs, we'd love to hear from you.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-electric-500/10">
                      <Mail className="w-5 h-5 text-electric-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Email</h3>
                      <a href="mailto:info@getonramp.io" className="text-carbon-200 hover:text-electric-400 transition-colors">
                        info@getonramp.io
                      </a>
                      <p className="text-carbon-200 text-sm mt-1">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-electric-500/10">
                      <MapPin className="w-5 h-5 text-electric-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Location</h3>
                      <p className="text-carbon-200">San Diego, CA</p>
                      <p className="text-carbon-200 text-sm mt-1">Serving shops nationwide</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={mobileViewport}
              className="lg:col-span-3"
            >
              {submitted ? (
                <div className="p-8 md:p-12 rounded-2xl bg-carbon-800/60 border border-green-500/30 text-center">
                  <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-4">Message Sent</h3>
                  <p className="text-carbon-200 text-lg">
                    Thanks for reaching out! We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-carbon-800/60 border border-carbon-700/50 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-carbon-200 text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        className={errors.name ? errorInputClasses : inputClasses}
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-carbon-200 text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        onBlur={() => {
                          if (formData.email && !isValidEmail(formData.email)) {
                            setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
                          }
                        }}
                        className={errors.email ? errorInputClasses : inputClasses}
                        placeholder="you@shop.com"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div>
                      <label className="block text-carbon-200 text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          setFormData({ ...formData, phone: formatted });
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                        }}
                        onBlur={() => {
                          const digits = getPhoneDigits(formData.phone);
                          if (digits.length > 0 && digits.length < 10) {
                            setErrors((prev) => ({ ...prev, phone: 'Please enter a full 10-digit phone number' }));
                          }
                        }}
                        className={errors.phone ? errorInputClasses : inputClasses}
                        placeholder="(555) 555-5555"
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-carbon-200 text-sm font-medium mb-2">I am a...</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={`${inputClasses} pr-12`}
                      >
                        <option value="" className="bg-carbon-900">Select your role</option>
                        <option value="Technician" className="bg-carbon-900">Technician</option>
                        <option value="Service Manager" className="bg-carbon-900">Service Manager</option>
                        <option value="Shop Owner" className="bg-carbon-900">Shop Owner</option>
                        <option value="Other" className="bg-carbon-900">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Shop Name with Google Places Autocomplete — full width row */}
                  <div className="relative" ref={suggestionsRef}>
                    <label className="block text-carbon-200 text-sm font-medium mb-2">Shop / Dealership</label>
                    {shopSelected ? (
                      // Selected state: show shop name + address with clear button
                      <div className="relative">
                        <div className={`${inputClasses} pr-10 cursor-default`}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-electric-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-white text-sm font-medium">{formData.shopName}</div>
                              <div className="text-carbon-200 text-xs">{formData.shopAddress}</div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearShopSelection}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon-200 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      // Search state: input with search icon
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon-200" />
                        <input
                          type="text"
                          value={formData.shopName}
                          onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                          onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                          }}
                          className={`${inputClasses} pl-10`}
                          placeholder="Search by name (e.g., BMW of Carlsbad)"
                        />
                      </div>
                    )}

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 rounded-xl bg-carbon-800 border border-carbon-700/50 shadow-2xl max-h-64 overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-semibold text-carbon-200 bg-carbon-800/80 border-b border-carbon-700/30 rounded-t-xl">
                          Service Centers Near You
                        </div>
                        {suggestions.map((place, idx) => (
                          <button
                            key={`place-${idx}`}
                            type="button"
                            onClick={() => selectPlace(place)}
                            className="w-full text-left px-4 py-3 hover:bg-carbon-700/50 border-b border-carbon-700/20 last:border-b-0 last:rounded-b-xl transition-colors"
                          >
                            <div className="text-white text-sm font-medium">{place.name}</div>
                            <div className="text-carbon-200 text-xs mt-0.5">{place.formattedAddress}</div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setShowSuggestions(false);
                            // Let them keep typing manually
                          }}
                          className="w-full text-left px-4 py-2.5 text-carbon-200 hover:text-carbon-200 text-xs border-t border-carbon-700/30 transition-colors"
                        >
                          Can't find your shop? Just type the name manually
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-carbon-200 text-sm font-medium mb-2">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
                      }}
                      className={`${errors.message ? errorInputClasses : inputClasses} resize-none`}
                      placeholder="Tell us about your shop and what you're looking for..."
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="group w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-electric-600 to-electric-700 hover:from-electric-500 hover:to-electric-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
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
