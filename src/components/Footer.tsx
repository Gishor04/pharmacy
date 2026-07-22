import React from 'react';
import { Pill, Phone, Clock, MessageSquare, ShieldCheck, HelpCircle, FileText, Truck, RefreshCw, Briefcase, Share2 } from 'lucide-react';
import { translations, Language } from '../translations';

interface FooterProps {
  currentLang: Language;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    elderlyMode: boolean;
  };
  setView: (view: string) => void;
}

export default function Footer({ currentLang, accessibility, setView }: FooterProps) {
  const t = translations[currentLang];

  return (
    <footer
      className={`w-full py-12 px-6 transition-all border-t ${
        accessibility.highContrast 
          ? 'bg-black text-white border-yellow-400' 
          : 'bg-[#0b172a] text-gray-300 border-gray-800'
      }`}
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* About column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-[#22A06B] text-white">
              <Pill className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className={`font-bold text-white ${accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
              {t.brandName}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Providing modern clinical pharmacy products, secure prescription clearing, and state-of-the-art AI medical advisor features to Jaffna families since 2014.
          </p>
          <div className="flex space-x-3 text-xs text-gray-400">
            <span className="bg-gray-800 px-2.5 py-1 rounded border border-gray-700 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22A06B]" aria-hidden="true" />
              <span>SLMC Certified No. 9842</span>
            </span>
          </div>
        </div>

        {/* Contact column */}
        <div className="space-y-4">
          <h4 className={`font-bold text-white ${accessibility.largeText ? 'text-lg' : 'text-sm'}`}>
            Contact & Location
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start space-x-2">
              <Phone className="w-4 h-4 text-[#22A06B] shrink-0 mt-0.5" aria-hidden="true" />
              <span>Jaffna Hospital Road, Jaffna, Sri Lanka (Opposite Teaching Hospital)</span>
            </li>
            <li className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#22A06B]" aria-hidden="true" />
              <span>WhatsApp: +94 (77) 123-4567</span>
            </li>
            <li className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#22A06B]" aria-hidden="true" />
              <span>{t.hours}: 07:30 AM - 10:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Policies & Help Column */}
        <div className="space-y-4">
          <h4 className={`font-bold text-white ${accessibility.largeText ? 'text-lg' : 'text-sm'}`}>
            Policies & Help
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <button 
                onClick={() => setView('refund-policy')} 
                className="hover:underline flex items-center space-x-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22A06B]"
                aria-label="View Refund Policy"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#22A06B]" aria-hidden="true" />
                <span>Refund Policy</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setView('delivery-policy')} 
                className="hover:underline flex items-center space-x-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22A06B]"
                aria-label="View Delivery Policy"
              >
                <Truck className="w-3.5 h-3.5 text-[#22A06B]" aria-hidden="true" />
                <span>Delivery Policy</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setView('faq')} 
                className="hover:underline flex items-center space-x-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22A06B]"
                aria-label="View Frequently Asked Questions"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#22A06B]" aria-hidden="true" />
                <span>FAQ</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setView('careers')} 
                className="hover:underline flex items-center space-x-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22A06B]"
                aria-label="View Career opportunities"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#22A06B]" aria-hidden="true" />
                <span>Careers</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Licensed Operations */}
        <div className="space-y-4">
          <h4 className={`font-bold text-white ${accessibility.largeText ? 'text-lg' : 'text-sm'}`}>
            Licensed Operations
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <strong>Pharmacist-in-Charge:</strong> <br />
              Dr. K. Gnanapragasam, B.Pharm, SLMC-PHA-9842
            </li>
            <li>
              <strong>Paediatric Consultant:</strong> <br />
              Ms. Ahilya Selvam, D.Pharm, SLMC-PHA-1045
            </li>
            <li>
              <strong>Emergency Dispatch:</strong> <br />
              +94 (21) 222-2222
            </li>
          </ul>
        </div>

        {/* Social Links & WhatsApp Fast Order */}
        <div className="space-y-4">
          <h4 className={`font-bold text-white ${accessibility.largeText ? 'text-lg' : 'text-sm'}`}>
            Connect & Order
          </h4>
          <p className="text-xs text-gray-400">
            Prefer ordering on WhatsApp? Click below to send your prescription list directly!
          </p>
          <a
            href="https://wa.me/94771234567?text=Hello%20Gishor%20Pharmacy,%20I%20would%20like%20to%20order%20medicines."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#16A34A] text-white font-semibold rounded-lg hover:bg-[#15803d] transition shadow-md w-full justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            id="footer-whatsapp-order-link"
            aria-label="Order via WhatsApp directly"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>Order via WhatsApp</span>
          </a>

          <div className="pt-2">
            <span className="text-xs text-gray-400 block mb-2 font-semibold">Follow Us</span>
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-[#0F6CBD] rounded-lg text-gray-300 hover:text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD]" aria-label="Facebook Page">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-pink-600 rounded-lg text-gray-300 hover:text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600" aria-label="Instagram Profile">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-[#0F6CBD] rounded-lg text-gray-300 hover:text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD]" aria-label="X (Twitter) Profile">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg text-gray-300 hover:text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600" aria-label="YouTube Channel">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width legal medical disclaimer */}
      <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-gray-800 text-xs text-gray-500 space-y-3">
        <p className="leading-relaxed bg-black/30 p-4 rounded-lg border border-gray-800 text-center text-gray-400">
          <strong>{t.disclaimerLabel.toUpperCase()}:</strong> {t.warningBanner}
        </p>
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-2 text-[11px]">
          <span>© 2026 Kaithady MediCare Hub (Pvt) Ltd. All Rights Reserved. Reg No: PV-40592. Jaffna Sri Lanka.</span>
          <div className="flex flex-wrap justify-center space-x-4">
            <button onClick={() => setView('privacy')} className="hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22A06B]">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => setView('refund-policy')} className="hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22A06B]">Refund Policy</button>
            <span>•</span>
            <button onClick={() => setView('delivery-policy')} className="hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22A06B]">Delivery Policy</button>
            <span>•</span>
            <span className="text-red-400 font-bold">Emergency Ambulance: 1990</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
