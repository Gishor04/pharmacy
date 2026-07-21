import React from 'react';
import { Pill, Phone, Clock, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { translations, Language } from '../translations';

interface FooterProps {
  currentLang: Language;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    elderlyMode: boolean;
  };
}

export default function Footer({ currentLang, accessibility }: FooterProps) {
  const t = translations[currentLang];

  return (
    <footer className={`w-full py-12 px-6 transition-all border-t ${
      accessibility.highContrast 
        ? 'bg-black text-white border-yellow-400' 
        : 'bg-[#0b172a] text-gray-300 border-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-[#22A06B] text-white">
              <Pill className="w-5 h-5" />
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
              <ShieldCheck className="w-3.5 h-3.5 text-[#22A06B]" />
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
              <Phone className="w-4 h-4 text-[#22A06B] shrink-0 mt-0.5" />
              <span>Jaffna Hospital Road, Jaffna, Sri Lanka (Opposite Teaching Hospital)</span>
            </li>
            <li className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#22A06B]" />
              <span>WhatsApp: +94 (77) 123-4567</span>
            </li>
            <li className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#22A06B]" />
              <span>{t.hours}: 07:30 AM - 10:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Important Guidelines / Quick links */}
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

        {/* Social / WhatsApp banner */}
        <div className="space-y-4">
          <h4 className={`font-bold text-white ${accessibility.largeText ? 'text-lg' : 'text-sm'}`}>
            WhatsApp Fast Order
          </h4>
          <p className="text-xs text-gray-400">
            Prefer ordering on WhatsApp? Click below to send a copy of your prescription list directly to our dispatch counter!
          </p>
          <a
            href="https://wa.me/94771234567?text=Hello%20Gishor%20Pharmacy,%20I%20would%20like%20to%20order%20medicines."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#16A34A] text-white font-semibold rounded-lg hover:bg-[#15803d] transition shadow-md w-full justify-center"
            id="footer-whatsapp-order-link"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Order via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Full-width legal medical disclaimer as strictly demanded */}
      <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-gray-800 text-xs text-gray-500 space-y-3">
        <p className="leading-relaxed bg-black/30 p-4 rounded-lg border border-gray-800 text-center text-gray-400">
          <strong>{t.disclaimerLabel.toUpperCase()}:</strong> {t.warningBanner}
        </p>
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-2 text-[11px]">
          <span>© 2026 Gishor Pharmacy (Pvt) Ltd. All Rights Reserved. Reg No: PV-40592. Jaffna Srilanka.</span>
          <div className="flex space-x-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms & Conditions</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Emergency Ambulance: 1990</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
