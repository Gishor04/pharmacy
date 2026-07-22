import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Pill, Search, Star, Heart, ShoppingBag, ArrowRight, ShieldCheck,
  MapPin, Clock, MessageSquare, AlertCircle, Calendar, FileText, CheckCircle,
  Trash2, User, ChevronRight, TrendingUp, Users, ClipboardList, Settings,
  AlertTriangle, RefreshCw, Layers, PhoneCall, Video, Check, Truck, HelpCircle,
  Briefcase, Mail, Tag, Package, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';

// Code splitting heavy components with React.lazy
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const DrugInteractionChecker = lazy(() => import('./components/DrugInteractionChecker'));
const PrescriptionUpload = lazy(() => import('./components/PrescriptionUpload'));
const VoiceSearch = lazy(() => import('./components/VoiceSearch'));

import { translations, Language } from './translations';
import {
  UserRole, Medicine, MedicineCategory, Order, OrderStatus,
  Appointment, RefillSchedule, ActivityLog, PrescriptionOCR
} from './types';

export default function App() {
  // Global Language & Accessibility
  const [currentLang, setLang] = useState<Language>('en');
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
    elderlyMode: false
  });

  const t = translations[currentLang];

  // Client Routing State
  const [currentView, setView] = useState<string>('home'); // 'home', 'shop', 'tele', 'blog', 'about', 'cart', 'dashboard-customer', 'dashboard-pharmacist', 'dashboard-admin'

  // Data States
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refills, setRefills] = useState<RefillSchedule[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Cart & Wishlist Local States
  const [cart, setCart] = useState<{ medicineId: string; name: string; quantity: number; price: number; strength: string }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('No 45, Temple Road, Jaffna');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Card' | 'Mobile Wallet'>('Cash on Delivery');

  // Active User Authentication
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: UserRole; allergies?: string[]; chronicConditions?: string[] } | null>({
    id: "u-1",
    name: "Gishor Srilanka",
    email: "customer@gishor.com",
    role: UserRole.CUSTOMER,
    allergies: ["Penicillin"],
    chronicConditions: ["Diabetes"]
  });

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [authError, setAuthError] = useState('');

  // Additional Registration Fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Jaffna');
  const [regAllergies, setRegAllergies] = useState('');
  const [regConditions, setRegConditions] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regAdminKey, setRegAdminKey] = useState('');

  // Add Medicine Form State
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedGeneric, setNewMedGeneric] = useState('');
  const [newMedCategory, setNewMedCategory] = useState('Antibiotics');
  const [newMedPrice, setNewMedPrice] = useState<number>(150);
  const [newMedStrength, setNewMedStrength] = useState('500mg');
  const [newMedStock, setNewMedStock] = useState<number>(100);
  const [newMedDesc, setNewMedDesc] = useState('');
  const [newMedUsage, setNewMedUsage] = useState('');
  const [newMedSideEffects, setNewMedSideEffects] = useState('');
  const [newMedWarnings, setNewMedWarnings] = useState('Consult with a pharmacist.');
  const [newMedRequiresRx, setNewMedRequiresRx] = useState(false);
  const [newMedImage, setNewMedImage] = useState('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60');

  const [addMedError, setAddMedError] = useState('');
  const [addMedSuccess, setAddMedSuccess] = useState('');
  const [isSubmittingMed, setIsSubmittingMed] = useState(false);

  // Schedulers & Drafts
  const [draftOCR, setDraftOCR] = useState<PrescriptionOCR | null>(null);
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<Appointment | null>(null);

  // Load Data on Boot
  const loadData = async () => {
    try {
      const medRes = await fetch(`/api/medicines?search=${searchQuery}&category=${selectedCategory}`);
      if (medRes.ok) setMedicines(await medRes.ok ? await medRes.json() : []);

      const catRes = await fetch('/api/categories');
      if (catRes.ok) setCategories(await catRes.json());

      const ordRes = await fetch('/api/orders');
      if (ordRes.ok) setOrders(await ordRes.json());

      const apptRes = await fetch('/api/appointments');
      if (apptRes.ok) setAppointments(await apptRes.json());

      const refRes = await fetch('/api/refills');
      if (refRes.ok) setRefills(await refRes.json());

      const logRes = await fetch('/api/logs');
      if (logRes.ok) setActivityLogs(await logRes.json());

      const blogRes = await fetch('/api/blogs');
      if (blogRes.ok) setBlogs(await blogRes.json());
    } catch (err) {
      console.error("Error loading server data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory]);

  // Auth Logics
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword, role: authRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Authentication failed");
      }

      const data = await response.json();
      setCurrentUser(data.user);
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      // Route immediately to the respective dashboard
      if (data.user.role === UserRole.CUSTOMER) setView('dashboard-customer');
      else if (data.user.role === UserRole.PHARMACIST) setView('dashboard-pharmacist');
      else if (data.user.role === UserRole.ADMIN) setView('dashboard-admin');

      loadData();
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Admin validation key check
    if (authRole === UserRole.ADMIN && regAdminKey !== 'ADMIN123' && regAdminKey !== '') {
      setAuthError('Invalid Admin Access Key. (Leave blank or use ADMIN123 for sandbox auth)');
      return;
    }

    try {
      const payload = {
        name: regName,
        email: authEmail,
        password: authPassword,
        role: authRole,
        phone: regPhone,
        address: authRole === UserRole.PHARMACIST ? `License: ${regLicense}` : regAddress,
        city: regCity,
        allergies: regAllergies ? regAllergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        chronicConditions: regConditions ? regConditions.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await response.json();
      setCurrentUser(data.user);
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      setRegName('');
      setRegPhone('');
      setRegAddress('');
      setRegAllergies('');
      setRegConditions('');
      setRegLicense('');
      setRegAdminKey('');
      setAuthMode('login');

      // Route immediately to the respective dashboard
      if (data.user.role === UserRole.CUSTOMER) setView('dashboard-customer');
      else if (data.user.role === UserRole.PHARMACIST) setView('dashboard-pharmacist');
      else if (data.user.role === UserRole.ADMIN) setView('dashboard-admin');

      loadData();
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
    setCart([]);
  };

  // Add Medicine Form Handler
  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMedError('');
    setAddMedSuccess('');
    setIsSubmittingMed(true);

    try {
      const payload = {
        name: newMedName,
        genericName: newMedGeneric,
        category: newMedCategory,
        price: Number(newMedPrice),
        description: newMedDesc,
        usageInstructions: newMedUsage,
        sideEffects: newMedSideEffects ? newMedSideEffects.split(',').map(s => s.trim()).filter(Boolean) : [],
        warnings: newMedWarnings,
        strength: newMedStrength,
        stock: Number(newMedStock),
        image: newMedImage,
        requiresPrescription: newMedRequiresRx
      };

      const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add medicine');
      }

      setAddMedSuccess('Medicine added successfully to the Gishor medical store!');

      // Reset form fields
      setNewMedName('');
      setNewMedGeneric('');
      setNewMedPrice(150);
      setNewMedStrength('500mg');
      setNewMedStock(100);
      setNewMedDesc('');
      setNewMedUsage('');
      setNewMedSideEffects('');
      setNewMedWarnings('Consult with a pharmacist.');
      setNewMedRequiresRx(false);

      // Close modal after 1.5s
      setTimeout(() => {
        setShowAddMedModal(false);
        setAddMedSuccess('');
      }, 1500);

      // Refresh data
      loadData();
    } catch (err: any) {
      setAddMedError(err.message || 'Error creating medicine.');
    } finally {
      setIsSubmittingMed(false);
    }
  };

  // Cart Operations
  const addToCart = (med: Medicine) => {
    setCart(prev => {
      const exists = prev.find(item => item.medicineId === med.id);
      if (exists) {
        return prev.map(item => item.medicineId === med.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { medicineId: med.id, name: med.name, quantity: 1, price: med.price, strength: med.strength }];
    });
  };

  const removeFromCart = (medId: string) => {
    setCart(prev => prev.filter(item => item.medicineId !== medId));
  };

  const updateQuantity = (medId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medId);
      return;
    }
    setCart(prev => prev.map(item => item.medicineId === medId ? { ...item, quantity } : item));
  };

  // Order Submission (Regular or Draft Confirmation)
  const submitOrder = async (isConfirmingDraft = false, ocrPayload?: PrescriptionOCR, imgUrl?: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const orderPayload = {
      customerId: currentUser.id,
      customerName: currentUser.name,
      items: isConfirmingDraft && ocrPayload
        ? [{ medicineId: "med-2", name: ocrPayload.medicineName, quantity: 1, price: 1200, strength: ocrPayload.strength }]
        : cart,
      paymentMethod,
      deliveryAddress,
      prescriptionUrl: imgUrl || draftImage || undefined,
      ocrDetails: ocrPayload || draftOCR || undefined,
      notes: isConfirmingDraft ? "Order drafted via AI prescription vision OCR" : "Customer cart purchase"
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) throw new Error("Order creation issue");

      const createdOrder = await response.json();

      // Clear cart
      if (!isConfirmingDraft) setCart([]);
      setDraftOCR(null);
      setDraftImage(null);

      // Route to customer dashboard
      setView('dashboard-customer');
      loadData();
    } catch (err) {
      alert("Order could not be registered. Check network connection.");
    }
  };

  // Pharmacist Approve Order
  const approveOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/approve`, {
        method: 'POST'
      });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Telepharmacy booking
  const bookAppointment = async (ph: any, date: string, slot: string, type: 'Chat' | 'Voice' | 'Video') => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser.id,
          customerName: currentUser.name,
          pharmacistId: ph.id,
          pharmacistName: ph.name,
          date,
          timeSlot: slot,
          type
        })
      });
      if (response.ok) {
        loadData();
        setView('dashboard-customer');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // OCR Draft Trigger
  const handleOCRReceived = (ocr: PrescriptionOCR, imgMock: string) => {
    setDraftOCR(ocr);
    setDraftImage(imgMock);
    setView('cart'); // Immediately go to cart to review drafted order
  };

  // WhatsApp Checkout Helper
  const generateWhatsAppCheckout = () => {
    let text = `*KAITHADY MEDICARE HUB ORDER REQUEST*\n`;
    text += `Customer: ${currentUser?.name || "Guest"}\n`;
    text += `Delivery Address: ${deliveryAddress}\n\n`;
    text += `*ITEMS:*\n`;
    cart.forEach(item => {
      text += `- ${item.name} (${item.strength}) x${item.quantity} = LKR ${item.price * item.quantity}\n`;
    });
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    text += `\n*TOTAL:* LKR ${total}\n`;
    text += `_Please review and dispatch these items. Thank you._`;

    const encoded = encodeURIComponent(text);
    return `https://wa.me/94771234567?text=${encoded}`;
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${accessibility.highContrast ? 'bg-black text-white' : 'bg-[#F5FAFF]'
      }`}>
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link font-bold text-xs rounded-b-lg shadow-md">
        Skip to main content
      </a>

      {/* Dynamic Banner alerts */}
      <div className="bg-[#22A06B] text-white text-[11px] font-bold text-center py-1 flex items-center justify-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
        <span>Jaffna's certified clinical grade healthcare provider. Pharmacist-in-charge: Dr. K. Gnanapragasam.</span>
      </div>

      <Header
        currentLang={currentLang}
        setLang={setLang}
        accessibility={accessibility}
        setAccessibility={setAccessibility}
        currentView={currentView}
        setView={setView}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        openAuthModal={() => setShowAuthModal(true)}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">

        {/* ELDERLY FRIENDLY BANNER MODE */}
        {accessibility.elderlyMode && (
          <div className="bg-amber-100 border-2 border-amber-400 text-amber-900 rounded-2xl p-5 mb-6 flex items-center space-x-4">
            <span className="text-3xl">👴👵</span>
            <div>
              <h3 className="font-extrabold text-xl">Elderly Mode Active</h3>
              <p className="text-sm font-semibold">We have increased font sizes and contrast. Scroll down easily, or click the green buttons to navigate.</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* HOME VIEW */}
          {currentView === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
              id="view-home"
            >
              {/* Hero section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl p-6 lg:p-10 border border-gray-100 shadow-xs relative overflow-hidden dark:bg-zinc-950 dark:border-zinc-900">
                <div className="lg:col-span-7 flex flex-col justify-center space-y-6 z-10">
                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs uppercase px-3.5 py-1.5 rounded-full inline-block self-start">
                    🏥 Certified Sri Lankan Pharmacy • SLMC Reg. 9842
                  </span>
                  <h2 className={`font-bold tracking-tight text-gray-900 leading-tight dark:text-white ${accessibility.largeText ? 'text-4xl lg:text-5xl' : 'text-3xl lg:text-4xl'
                    }`}>
                    Order Medicines Online in <span className="text-[#0F6CBD]">Jaffna</span> &amp; Get Fast Delivery
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-lg dark:text-gray-400">
                    Jaffna's premier clinical e-commerce store. Upload your prescription for instant AI order drafting, browse thousands of certified Over-The-Counter medicines, and consult our licensed pharmacists on video call.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-3.5">
                    <button
                      onClick={() => setView('shop')}
                      className="bg-[#0F6CBD] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl hover:bg-[#0c599c] transition shadow-md hover:shadow-lg flex items-center space-x-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Order Medicines</span>
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('prescription-upload-section');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl hover:bg-gray-50 transition shadow-xs flex items-center space-x-2 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-800"
                    >
                      <FileText className="w-4 h-4 text-[#0F6CBD]" />
                      <span>Upload Prescription</span>
                    </button>
                    <button
                      onClick={() => setView('tele')}
                      className="bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl hover:bg-emerald-100 transition flex items-center space-x-2 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Talk to Pharmacist</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-[#22A06B]" />
                      <span>SLMC Licensed</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-[#22A06B]" />
                      <span>Free Home Delivery</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-[#22A06B]" />
                      <span>Secure Payment</span>
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
                  <div className="relative">
                    <div className="w-[340px] h-[340px] rounded-3xl overflow-hidden shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
                        alt="Kaithady MediCare Hub clinical counter"
                        referrerPolicy="no-referrer"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Floating active stats card */}
                    <div className="absolute -bottom-4 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-3 dark:bg-zinc-900 dark:border-zinc-800">
                      <div className="p-2 rounded-xl bg-[#22A06B] text-white font-bold text-xs">
                        100%
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold">ACCURACY</span>
                        <span className="text-xs font-extrabold text-gray-800 dark:text-white">Licensed Pharmacist</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Offers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-gray-900 dark:text-white ${accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                    Exclusive Healthcare Offers &amp; Discounts
                  </h3>
                  <span className="text-xs font-bold text-[#0F6CBD] uppercase tracking-wider">Save on Refills</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-40 shadow-xs">
                    <div>
                      <span className="bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Elderly Care
                      </span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-2">Senior Citizen Privilege</h4>
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Get 10% Flat discount on monthly chronic disease refilling orders.</p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-extrabold text-blue-700 dark:text-blue-400">
                      <span>Promo Code: SENIOR10</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-40 shadow-xs">
                    <div>
                      <span className="bg-[#22A06B] text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        New Customer
                      </span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-2">First Order Special</h4>
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Free delivery within Jaffna municipal limits for your first online transaction.</p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                      <span>Applied Automatically</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-40 shadow-xs">
                    <div>
                      <span className="bg-purple-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        WhatsApp Fast
                      </span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-2">Refill reminders &amp; Ordering</h4>
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Enable automated reminders and re-order clinical items via WhatsApp.</p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-extrabold text-purple-700 dark:text-purple-400">
                      <span>Message "REFILL"</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Categories Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-gray-900 dark:text-white ${accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                    Shop by Featured Category
                  </h3>
                  <button
                    onClick={() => { setSelectedCategory('All'); setView('shop'); }}
                    className="text-xs font-bold text-[#0F6CBD] hover:underline"
                  >
                    View All Products
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {categories.map(cat => {
                    const getCategoryIcon = (name: string) => {
                      switch (name) {
                        case 'Prescription Medicines': return '💊';
                        case 'OTC Medicines': return '🩹';
                        case 'Wellness': return '🧴';
                        case 'Baby Care': return '👶';
                        case 'Elderly Care': return '👵';
                        case 'Supplements': return '⚡';
                        default: return '📦';
                      }
                    };
                    return (
                      <div
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.name); setView('shop'); }}
                        className="bg-white border border-gray-100 dark:bg-zinc-950 dark:border-zinc-900 p-4 rounded-2xl shadow-xs text-center cursor-pointer hover:border-[#0F6CBD] hover:shadow-md transition group"
                      >
                        <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-200">
                          {getCategoryIcon(cat.name)}
                        </span>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate">{cat.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-1">{cat.itemCount || 0} Items</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Best Selling Medicines Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-gray-900 dark:text-white ${accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                    Best Selling Medicines &amp; Healthcare Products
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fastest Delivery</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {medicines.slice(0, 4).map(med => (
                    <div
                      key={med.id}
                      className="bg-white border border-gray-100 dark:bg-zinc-950 dark:border-zinc-900 rounded-3xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        <div className="relative h-40 rounded-2xl overflow-hidden mb-3 bg-gray-50">
                          <img
                            src={med.image}
                            alt={med.name}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          {med.requiresPrescription ? (
                            <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider">
                              RX REQUIRED
                            </span>
                          ) : (
                            <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider">
                              OTC ONLY
                            </span>
                          )}
                          {med.manufacturer && (
                            <span className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-zinc-900/90 text-gray-800 dark:text-gray-200 text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-xs border border-gray-200 dark:border-zinc-700">
                              {med.manufacturer}
                            </span>
                          )}
                          <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            LKR {med.price}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-[#0F6CBD] uppercase">{med.category}</span>
                            <div className="flex items-center text-yellow-400 text-[10px]">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span className="font-bold ml-0.5 text-gray-700 dark:text-zinc-300">{med.rating || '4.8'}</span>
                            </div>
                          </div>
                          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm line-clamp-1">{med.name}</h4>
                          <p className="text-[10px] text-gray-400 truncate">Gen: {med.genericName}</p>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{med.description}</p>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-gray-50 dark:border-zinc-900 flex items-center justify-between gap-2">
                        <div className="text-xs">
                          <span className="block text-[9px] text-gray-400">STRENGTH</span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">{med.strength}</span>
                        </div>
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => { setSelectedImageIndex(0); setSelectedMed(med); }}
                            className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-lg border border-gray-200 transition dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6CBD]"
                            aria-label={`View details of ${med.name}`}
                          >
                            Details
                          </button>
                          <button
                            onClick={() => addToCart(med)}
                            className="px-3 py-1 bg-[#0F6CBD] hover:bg-[#0c599c] text-white text-[10px] font-bold rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6CBD]"
                            aria-label={`Add ${med.name} to cart`}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescription Quick-CTA Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="font-bold text-xl sm:text-2xl">Have a Doctor's Prescription?</h3>
                  <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                    Upload your prescription image below. Our AI Vision system will extract the prescription details instantly, compile a draft cart, and route it to our licensed pharmacist Dr. K. Gnanapragasam for rapid SLMC authorization!
                  </p>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById('prescription-upload-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl transition shadow-sm whitespace-nowrap"
                >
                  Go to Upload Area ⚡
                </button>
              </div>

              {/* Main functional split: Chat assistant + Prescription vision upload */}
              <div className="space-y-4">
                <div>
                  <h3 className={`font-bold text-gray-900 dark:text-white ${accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                    Interactive AI Health Center
                  </h3>
                  <p className="text-xs text-gray-400">Access instant digital triage and safety checks before ordering</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* AI Assistant Chat column */}
                  <div className="lg:col-span-7">
                    <Suspense fallback={<div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border text-center text-xs font-semibold text-gray-400">Loading AI Assistant...</div>}>
                      <AIAssistant currentLang={currentLang} accessibility={accessibility} />
                    </Suspense>
                  </div>

                  {/* Prescription visión ocr column */}
                  <div className="lg:col-span-5 space-y-6" id="prescription-upload-section">
                    <Suspense fallback={<div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border text-center text-xs font-semibold text-gray-400">Loading Prescription Upload...</div>}>
                      <PrescriptionUpload
                        currentLang={currentLang}
                        accessibility={accessibility}
                        onOrderDraftCreated={handleOCRReceived}
                      />
                    </Suspense>

                    {/* Quick Drug interaction checker widget */}
                    <Suspense fallback={<div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border text-center text-xs font-semibold text-gray-400">Loading Drug Interaction Checker...</div>}>
                      <DrugInteractionChecker currentLang={currentLang} accessibility={accessibility} />
                    </Suspense>
                  </div>
                </div>
              </div>

              {/* Why Choose Us & Trust Signals Section */}
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 lg:p-8 dark:bg-zinc-950 dark:border-zinc-900 space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-[#0F6CBD] uppercase tracking-wider">Clinical Integrity</span>
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">Why Jaffna Trusts Kaithady MediCare Hub</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">Providing certified pharmaceuticals with maximum compliance, security, and digital convenience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-zinc-800 text-emerald-600 flex items-center justify-center mx-auto text-lg">
                      📋
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">SLMC Registered</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Licensed under registration code SLMC-9842-CORP with dedicated full-time clinical oversight.</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-zinc-800 text-blue-600 flex items-center justify-center mx-auto text-lg">
                      🛡️
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">Child-Proof Packaging</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">All prescription containers are sealed in child-resistant discrete clinical medical wraps.</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-zinc-800 text-purple-600 flex items-center justify-center mx-auto text-lg">
                      🚚
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">Express Doorstep Delivery</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Same-day secure cold-chain delivery of temperature-sensitive vaccines &amp; insulins across Jaffna.</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-zinc-800 text-yellow-600 flex items-center justify-center mx-auto text-lg">
                      🔒
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">Payment &amp; Data Security</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">PCI-DSS compliant card checkout combined with absolute encrypted patient data storage.</p>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-gray-900 dark:text-white ${accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                    Verified Patient Testimonials
                  </h3>
                  <div className="flex items-center text-xs text-yellow-400 space-x-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                    <span className="font-bold text-gray-700 dark:text-zinc-300">4.9 / 5 (Based on Google Reviews)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#F3FCF8] p-6 rounded-3xl dark:bg-zinc-950 border border-emerald-100 dark:border-zinc-900 space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">👴</span>
                      <div>
                        <span className="font-extrabold text-xs text-gray-800 dark:text-white block">Mr. Sunil Herath</span>
                        <span className="text-[9px] text-[#22A06B] font-bold uppercase tracking-wider flex items-center">
                          <Check className="w-3 h-3 mr-0.5" /> Verified Chronic Patient
                        </span>
                      </div>
                    </div>
                    <p className="text-xs italic text-gray-600 dark:text-gray-300 font-medium">
                      "Using the Large Text and Sinhala language features is so easy. Gishor predicts my Metformin refills and reminds me through WhatsApp."
                    </p>
                  </div>

                  <div className="bg-[#F3FCF8] p-6 rounded-3xl dark:bg-zinc-950 border border-emerald-100 dark:border-zinc-900 space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">👩‍👦</span>
                      <div>
                        <span className="font-extrabold text-xs text-gray-800 dark:text-white block">Mrs. V. Tharmika</span>
                        <span className="text-[9px] text-[#22A06B] font-bold uppercase tracking-wider flex items-center">
                          <Check className="w-3 h-3 mr-0.5" /> Verified Buyer
                        </span>
                      </div>
                    </div>
                    <p className="text-xs italic text-gray-600 dark:text-gray-300 font-medium">
                      "I uploaded my child's antibiotics prescription image. The AI vision parsed it instantly, created a draft order, and a licensed pharmacist cleared it within minutes."
                    </p>
                  </div>

                  <div className="bg-[#F3FCF8] p-6 rounded-3xl dark:bg-zinc-950 border border-emerald-100 dark:border-zinc-900 space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🩺</span>
                      <div>
                        <span className="font-extrabold text-xs text-gray-800 dark:text-white block">Dr. S. Kugan</span>
                        <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider flex items-center dark:text-blue-400">
                          🩺 Certified Jaffna Clinician
                        </span>
                      </div>
                    </div>
                    <p className="text-xs italic text-gray-600 dark:text-gray-300 font-medium">
                      "Excellent clinical standards. Gishor drug interaction checker is powered by Gemini, giving accurate warning lights on anticoagulant risks."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SHOP VIEW */}
          {currentView === 'shop' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
              id="view-shop"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className={`font-bold text-gray-900 dark:text-white ${accessibility.largeText ? 'text-3xl' : 'text-2xl'}`}>
                    {t.navShop}
                  </h2>
                  <p className="text-xs text-gray-400">Sri Lankan clinical grade OTC and prescription medicines</p>
                </div>

                {/* Horizontal Filter */}
                <div className="flex flex-wrap gap-2">
                  {['All', ...categories.map(c => c.name)].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${selectedCategory === cat
                        ? 'bg-[#0F6CBD] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 dark:bg-zinc-900 dark:border-zinc-800'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of medicines */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {medicines.map(med => (
                  <div
                    key={med.id}
                    className="bg-white border border-gray-100 dark:bg-zinc-950 dark:border-zinc-900 rounded-3xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                    id={`med-card-${med.id}`}
                  >
                    <div>
                      <div className="relative h-44 rounded-2xl overflow-hidden mb-3 bg-gray-50">
                        <img
                          src={med.image}
                          alt={med.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {med.requiresPrescription ? (
                          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-md tracking-wider flex items-center space-x-1">
                            <span>RX REQUIRED</span>
                          </span>
                        ) : (
                          <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-md tracking-wider">
                            OTC ONLY
                          </span>
                        )}
                        {med.manufacturer && (
                          <span className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-zinc-900/90 text-gray-800 dark:text-gray-200 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-gray-200 dark:border-zinc-700">
                            {med.manufacturer}
                          </span>
                        )}
                        <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                          LKR {med.price}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{med.category}</span>
                          {med.manufacturer && <span className="text-[9px] font-bold text-[#0F6CBD]">{med.manufacturer}</span>}
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{med.name}</h4>
                        <p className="text-[11px] text-gray-500 italic">Gen: {med.genericName}</p>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{med.description}</p>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-gray-50 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="block text-[10px] text-gray-400">STRENGTH</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{med.strength}</span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setSelectedImageIndex(0); setSelectedMed(med); }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6CBD]"
                          aria-label={`View details of ${med.name}`}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => addToCart(med)}
                          className="px-3.5 py-1.5 bg-[#0F6CBD] hover:bg-[#0c599c] text-white text-xs font-bold rounded-lg shadow-xs transition"
                          id={`med-add-to-cart-${med.id}`}
                        >
                          {t.addToCart}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TELEPHARMACY VIEW */}
          {currentView === 'tele' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
              id="view-tele"
            >
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.teleTitle}</h2>
                <p className="text-xs text-gray-500">{t.teleSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Available Pharmacists list */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Sri Lankan Licensed Clinical Experts</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      {
                        id: "ph-1",
                        name: "Dr. K. Gnanapragasam",
                        licenseNumber: "SLMC-PHA-9842",
                        certifications: ["B.Pharm (Univ of Jaffna)", "Clinical Pharmacy Fellowship (NHS)"],
                        yearsOfService: 12,
                        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=60",
                        rating: 4.9,
                        status: "Online",
                        specialization: "Geriatric & Chronic Care"
                      },
                      {
                        id: "ph-2",
                        name: "Ms. Ahilya Selvam",
                        licenseNumber: "SLMC-PHA-1045",
                        certifications: ["D.Pharm (National Hospital Colombo)", "Paediatric Drug safety Cert"],
                        yearsOfService: 8,
                        avatar: "https://images.unsplash.com/photo-1594824813573-246434e33963?w=400&auto=format&fit=crop&q=60",
                        rating: 4.8,
                        status: "Online",
                        specialization: "Paediatric OTC Formulation"
                      }
                    ].map(ph => (
                      <div
                        key={ph.id}
                        className="bg-white border border-gray-100 p-5 rounded-2xl dark:bg-zinc-950 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="flex space-x-4 items-start">
                          <img
                            src={ph.avatar}
                            alt={ph.name}
                            className="w-16 h-16 rounded-xl object-cover border"
                          />
                          <div>
                            <span className="text-[9px] bg-green-100 text-[#22A06B] px-2 py-0.5 rounded-full font-bold uppercase block self-start mb-1">{ph.status}</span>
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">{ph.name}</h4>
                            <p className="text-xs text-gray-400 font-medium">Spec: {ph.specialization}</p>
                            <p className="text-[11px] text-gray-500 mt-1">License: {ph.licenseNumber}</p>
                          </div>
                        </div>

                        <div className="space-y-2 w-full md:w-auto">
                          <span className="text-xs text-gray-500 block">Available Slots Today:</span>
                          <div className="flex gap-2.5">
                            {["11:30 - 12:00", "14:00 - 14:30"].map(slot => (
                              <button
                                key={slot}
                                onClick={() => bookAppointment(ph, "2026-07-22", slot, "Video")}
                                className="px-3 py-1.5 bg-[#F5FAFF] hover:bg-[#0F6CBD] hover:text-white border border-[#0F6CBD]/20 text-[#0F6CBD] text-[10px] font-bold rounded-lg transition"
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemedicine advisory sidebar */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white dark:bg-zinc-950 border p-5 rounded-2xl space-y-4">
                    <h3 className="font-bold text-[#0F6CBD] text-sm">Online Prescriptions Clearance</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      In Sri Lanka, certain medications require active pharmacist clearance before physical dispatch. Book a voice or video slot to have Ms. Ahilya review your dosage instructions securely.
                    </p>
                    <div className="border-t pt-4 space-y-2">
                      <span className="text-xs font-bold block text-gray-400">Emergency Patient Care?</span>
                      <p className="text-xs text-red-600 font-semibold">Do not wait for booking slots if you are experiencing respiratory pain or sudden paralysis. Dial 1990 immediately.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* BLOG VIEW */}
          {currentView === 'blog' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
              id="view-blog"
            >
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.navBlog}</h2>
                <p className="text-xs text-gray-400">70% Educational clinical safety guidelines for family health</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogs.map(blog => (
                  <div
                    key={blog.id}
                    className="bg-white border border-gray-100 dark:bg-zinc-950 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="h-44 overflow-hidden relative">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-[#22A06B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {blog.category}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">{blog.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{blog.content}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 border-t border-gray-50 mt-2 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                      <span>By {blog.author}</span>
                      <span>{blog.readTime} read</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* OFFERS VIEW */}
          {currentView === 'offers' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6" id="view-offers">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.offersTitle}</h2>
                <p className="text-xs text-gray-400">Save on monthly refills, chronic care packages, and healthcare items</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <span className="bg-blue-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase">Senior Citizen</span>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">10% Off Monthly Chronic Refills</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Available for registered senior citizens ordering diabetic or cardiology medications.</p>
                  <div className="pt-2 border-t font-mono text-xs font-bold text-blue-700 dark:text-blue-400">CODE: SENIOR10</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase">First Order</span>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Free Doorstep Delivery</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Complimentary express home delivery across all Jaffna municipal zones for your first web order.</p>
                  <div className="pt-2 border-t font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">AUTO-APPLIED</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <span className="bg-purple-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase">Bundle Save</span>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Family First Aid Pack 15% Off</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Purchase OTC pain relief, antiseptic wipes, and bandages together for extra savings.</p>
                  <div className="pt-2 border-t font-mono text-xs font-bold text-purple-700 dark:text-purple-400">CODE: HEALTH15</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TRACK ORDER VIEW */}
          {currentView === 'track-order' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl mx-auto" id="view-track-order">
              <div className="text-center space-y-2">
                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.trackOrderTitle}</h2>
                <p className="text-xs text-gray-400">Enter your Order ID to verify real-time SLMC pharmacist dispatch status</p>
              </div>
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-gray-100 dark:border-zinc-900 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Order ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ord-1721500000000"
                      className="flex-1 bg-gray-50 dark:bg-zinc-900 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                    />
                    <button className="bg-[#0F6CBD] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0c599c]">Track</button>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-3 text-xs">
                  <div className="flex items-center space-x-3 text-emerald-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>Sample Order #ord-1: In Preparation (Pharmacist Dr. Gnanapragasam approved)</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Clock className="w-5 h-5" />
                    <span>Estimated Jaffna Delivery: Today within 2 hours</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CONTACT VIEW */}
          {currentView === 'contact' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl mx-auto" id="view-contact">
              <div className="text-center space-y-2">
                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.contactTitle}</h2>
                <p className="text-xs text-gray-400">We're here to answer your clinical, prescription, and delivery queries</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-gray-100 dark:border-zinc-900 space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-[#0F6CBD]">Pharmacy Counter Location</h3>
                  <p className="text-gray-500">Jaffna Hospital Road, Jaffna, Sri Lanka (Opposite Teaching Hospital)</p>
                  <div className="space-y-2 pt-2 border-t">
                    <p><strong>Hotline:</strong> +94 (21) 222-2222</p>
                    <p><strong>WhatsApp:</strong> +94 (77) 123-4567</p>
                    <p><strong>Email:</strong> support@gishor.com</p>
                    <p><strong>Hours:</strong> Daily 07:30 AM - 10:00 PM</p>
                  </div>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); alert("Thank you! Your message has been sent to our pharmacists."); }} className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-gray-100 dark:border-zinc-900 space-y-3 text-xs">
                  <h3 className="font-bold text-sm text-gray-800 dark:text-white">Send Us a Message</h3>
                  <input type="text" placeholder="Your Name" required className="w-full bg-gray-50 dark:bg-zinc-900 border rounded-xl px-3 py-2 text-xs" />
                  <input type="email" placeholder="Your Email" required className="w-full bg-gray-50 dark:bg-zinc-900 border rounded-xl px-3 py-2 text-xs" />
                  <textarea placeholder="Your Question or Inquiry..." required rows={3} className="w-full bg-gray-50 dark:bg-zinc-900 border rounded-xl px-3 py-2 text-xs resize-none" />
                  <button type="submit" className="w-full bg-[#0F6CBD] text-white py-2.5 rounded-xl font-bold hover:bg-[#0c599c]">Send Message</button>
                </form>
              </div>
            </motion.div>
          )}

          {/* REFUND POLICY VIEW */}
          {currentView === 'refund-policy' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl mx-auto" id="view-refund-policy">
              <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-gray-100 dark:border-zinc-900 space-y-4 text-xs leading-relaxed">
                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.refundPolicyTitle}</h2>
                <p className="text-gray-500">Effective Date: January 1, 2026 • Kaithady MediCare Hub (Pvt) Ltd</p>
                <h3 className="font-bold text-sm text-[#0F6CBD] mt-4">1. Prescriptions & Prescription Items</h3>
                <p className="text-gray-600 dark:text-gray-300">Under Sri Lanka NMRA regulations, opened prescription medicines cannot be returned once dispatched to preserve cold-chain and hygiene integrity. If an item delivered is damaged, expired, or incorrect against your upload, a 100% full refund or immediate replacement will be issued.</p>
                <h3 className="font-bold text-sm text-[#0F6CBD] mt-4">2. OTC Products & Wellness Items</h3>
                <p className="text-gray-600 dark:text-gray-300">Unopened Over-The-Counter products in original sealed packaging may be returned within 7 days of delivery with full proof of purchase.</p>
                <h3 className="font-bold text-sm text-[#0F6CBD] mt-4">3. Refund Processing Time</h3>
                <p className="text-gray-600 dark:text-gray-300">Approved refunds for card transactions are processed within 3-5 business days. Cash on delivery refunds are credited as Gishor Store Credits or bank transfer.</p>
              </div>
            </motion.div>
          )}

          {/* DELIVERY POLICY VIEW */}
          {currentView === 'delivery-policy' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl mx-auto" id="view-delivery-policy">
              <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-gray-100 dark:border-zinc-900 space-y-4 text-xs leading-relaxed">
                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.deliveryPolicyTitle}</h2>
                <p className="text-gray-500">Jaffna District Express Healthcare Logistics</p>
                <h3 className="font-bold text-sm text-[#0F6CBD] mt-4">1. Delivery Zones & Timelines</h3>
                <p className="text-gray-600 dark:text-gray-300">We offer same-day express delivery within Jaffna municipal limits (2-4 hours). Outer Jaffna peninsula areas (Chavakachcheri, Point Pedro, Nallur) are delivered within 6-12 hours.</p>
                <h3 className="font-bold text-sm text-[#0F6CBD] mt-4">2. Cold-Chain & Vaccine Transport</h3>
                <p className="text-gray-600 dark:text-gray-300">Temperature-sensitive items (insulin, vaccines) are packaged in insulated thermal boxes with gel packs, guaranteeing 2-8°C maintenance during transit.</p>
                <h3 className="font-bold text-sm text-[#0F6CBD] mt-4">3. Identity & Prescription Verification</h3>
                <p className="text-gray-600 dark:text-gray-300">Our delivery drivers may request to inspect original physical prescription slips for controlled medications upon arrival.</p>
              </div>
            </motion.div>
          )}

          {/* FAQ VIEW */}
          {currentView === 'faq' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl mx-auto" id="view-faq">
              <div className="text-center space-y-2">
                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.faqTitle}</h2>
                <p className="text-xs text-gray-400">Answers to common questions about prescription uploads, delivery, and telepharmacy</p>
              </div>
              <div className="space-y-4">
                {[
                  { q: "How does the AI Prescription Upload work?", a: "When you upload an image of your prescription, our AI Vision system extracts medicine names, dosages, and doctor notes to draft your cart automatically. A licensed SLMC pharmacist inspects and approves it before dispatch." },
                  { q: "Are all medicines certified?", a: "Yes, 100% of our pharmaceutical stock is sourced directly from NMRA-registered manufacturers and stored in climate-controlled premises under SLMC License No. 9842." },
                  { q: "Can I consult a pharmacist online?", a: "Yes! Use our Telepharmacy tab to book a video or voice call with Dr. Gnanapragasam or Ms. Ahilya for advice on dosage, side effects, and drug interactions." },
                  { q: "What payment options are supported?", a: "We accept Cash on Delivery, Credit/Debit cards, and Sri Lankan Mobile Wallets (mCash & eZ Cash)." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-900 space-y-2">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-white">Q: {item.q}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">A: {item.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CAREERS VIEW */}
          {currentView === 'careers' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl mx-auto" id="view-careers">
              <div className="text-center space-y-2">
                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.careersTitle}</h2>
                <p className="text-xs text-gray-400">Join Northern Sri Lanka's fastest growing digital pharmacy team</p>
              </div>
              <div className="space-y-4">
                {[
                  { role: "Clinical Pharmacist (Full-Time)", loc: "Jaffna Central Counter", req: "B.Pharm degree, valid SLMC registration, 2+ years clinical experience." },
                  { role: "Pharmacy Assistant / Dispenser", loc: "Jaffna", req: "Diploma in Pharmacy or NVQ Level 4 certification." },
                  { role: "Cold-Chain Logistics Courier", loc: "Jaffna Peninsula", req: "Valid riding license, clean record, familiarity with medical package handling." }
                ].map((job, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-gray-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-sm text-gray-800 dark:text-white">{job.role}</h3>
                      <p className="text-xs text-[#0F6CBD] font-semibold">{job.loc}</p>
                      <p className="text-xs text-gray-500 mt-1">{job.req}</p>
                    </div>
                    <button onClick={() => alert("Please send your CV to careers@gishor.com")} className="bg-[#22A06B] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1d8257] whitespace-nowrap">Apply Now</button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ABOUT VIEW */}
          {currentView === 'about' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
              id="view-about"
            >
              <div className="bg-white border p-6 rounded-3xl dark:bg-zinc-950 max-w-3xl mx-auto space-y-4">
                <h2 className="font-bold text-[#0F6CBD] text-2xl">{t.aboutTitle}</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Kaithady MediCare Hub was established in Jaffna in 2014 to serve the unique health concerns of local families, diabetic patients, and the elderly. Operating under licensed SLMC certifications, we combine human care with secure digital AI vision systems to guarantee dosage safety.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800 text-xs">
                  <div>
                    <strong>Pharmacy License Number:</strong>
                    <p className="text-gray-500 font-mono mt-0.5">SLMC-PHA-9842 (Jaffna Central)</p>
                  </div>
                  <div>
                    <strong>Pharmacist in Charge:</strong>
                    <p className="text-gray-500 mt-0.5">Dr. K. Gnanapragasam, B.Pharm</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CART VIEW */}
          {currentView === 'cart' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
              id="view-cart"
            >
              <h2 className="font-bold text-gray-900 dark:text-white text-2xl">{t.cartTitle}</h2>

              {/* Review AI Vision prescription draft banner */}
              {draftOCR && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-amber-900">
                  <div>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase block self-start mb-1">Prescription Draft Order</span>
                    <h4 className="font-bold text-sm">Reviewing Extracted Medicine: <strong className="underline">{draftOCR.medicineName}</strong></h4>
                    <p className="text-xs">Sig instructions: {draftOCR.dosage} | Doctor: {draftOCR.doctorName} ({draftOCR.hospital})</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { setDraftOCR(null); setDraftImage(null); }}
                      className="px-3 py-1.5 text-xs text-gray-500 font-semibold hover:underline"
                    >
                      Cancel Draft
                    </button>
                    <button
                      onClick={() => submitOrder(true, draftOCR)}
                      className="px-4 py-1.5 bg-[#22A06B] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#1d8257] transition"
                    >
                      Confirm and Place Order Draft
                    </button>
                  </div>
                </div>
              )}

              {cart.length === 0 && !draftOCR ? (
                <div className="text-center py-12 bg-white rounded-2xl border">
                  <Pill className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-400">{t.emptyCart}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-8 space-y-4">
                    {cart.map(item => (
                      <div
                        key={item.medicineId}
                        className="bg-white border p-4 rounded-2xl flex justify-between items-center gap-4 dark:bg-zinc-950 dark:border-zinc-900"
                      >
                        <div>
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <span className="text-[10px] bg-blue-100 text-[#0F6CBD] px-2 py-0.5 rounded-full font-bold">{item.strength}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <button onClick={() => updateQuantity(item.medicineId, item.quantity - 1)} className="p-1 bg-gray-100 rounded-lg">-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.medicineId, item.quantity + 1)} className="p-1 bg-gray-100 rounded-lg">+</button>
                          <span className="font-bold min-w-[70px] text-right">LKR {item.price * item.quantity}</span>
                          <button onClick={() => removeFromCart(item.medicineId)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Delivery Form */}
                    <div className="bg-white border p-5 rounded-3xl space-y-4 dark:bg-zinc-950 dark:border-zinc-900">
                      <h3 className="font-bold text-sm text-gray-800 dark:text-white">Delivery &amp; Logistics details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Jaffna Delivery Address</label>
                          <input
                            type="text"
                            value={deliveryAddress}
                            onChange={e => setDeliveryAddress(e.target.value)}
                            className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-xs dark:bg-zinc-900 dark:border-zinc-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1">Select Payment channel</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {(['Cash on Delivery', 'Card', 'Mobile Wallet'] as const).map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setPaymentMethod(m)}
                                className={`p-2.5 text-xs rounded-xl font-bold border text-left transition ${paymentMethod === m
                                  ? 'border-[#0F6CBD] bg-[#F5FAFF] text-[#0F6CBD] dark:bg-zinc-900'
                                  : 'border-gray-200 text-gray-600'
                                  }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Panel */}
                  <div className="lg:col-span-4">
                    <div className="bg-white border p-5 rounded-3xl space-y-4 dark:bg-zinc-950 dark:border-zinc-900">
                      <h3 className="font-bold text-sm text-gray-800 dark:text-white">Checkout Total</h3>
                      <div className="space-y-2 text-xs border-b pb-3 text-gray-500">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>LKR {cart.reduce((s, i) => s + (i.price * i.quantity), 0)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Delivery Fee (Jaffna district)</span>
                          <span>FREE</span>
                        </div>
                      </div>
                      <div className="flex justify-between font-bold text-sm">
                        <span>Total Payable</span>
                        <span>LKR {cart.reduce((s, i) => s + (i.price * i.quantity), 0)}</span>
                      </div>

                      <div className="space-y-2 pt-2">
                        <button
                          onClick={() => submitOrder(false)}
                          className="w-full py-2.5 bg-[#0F6CBD] hover:bg-[#0c599c] text-white text-xs font-bold rounded-xl shadow-xs transition"
                        >
                          Place Order via Website
                        </button>
                        <a
                          href={generateWhatsAppCheckout()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Order via WhatsApp Fast Pay</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* CUSTOMER DASHBOARD */}
          {currentView === 'dashboard-customer' && currentUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
              id="view-dashboard-customer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-2xl">Customer Dashboard</h2>
                  <p className="text-xs text-gray-400">Welcome back, {currentUser.name}</p>
                </div>
                <span className="bg-blue-100 text-[#0F6CBD] px-3 py-1 rounded-full text-xs font-bold">LKR 950 Credits</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile panel */}
                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border space-y-4 dark:bg-zinc-950 dark:border-zinc-900">
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Allergies &amp; Health details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">SAVED DRUG ALLERGIES:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentUser.allergies?.map(al => (
                          <span key={al} className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">{al}</span>
                        )) || <span className="text-xs text-gray-400">No allergies listed.</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">CHRONIC CONDITIONS:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentUser.chronicConditions?.map(cc => (
                          <span key={cc} className="bg-[#F5FAFF] text-[#0F6CBD] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">{cc}</span>
                        )) || <span className="text-xs text-gray-400">No chronic issues saved.</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orders / Reminders Panel */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Smart Refill Reminders predicting medication depletion */}
                  <div className="bg-[#F3FCF8] border border-emerald-200 rounded-3xl p-5 dark:bg-zinc-950 dark:border-zinc-900">
                    <h3 className="font-bold text-[#22A06B] text-sm mb-3">AI Predicts Smart Refill Dates</h3>
                    <div className="space-y-3">
                      {refills.map(ref => (
                        <div
                          key={ref.id}
                          className="bg-white border p-4 rounded-xl flex justify-between items-center gap-4 dark:bg-zinc-900 dark:border-zinc-800"
                        >
                          <div>
                            <h4 className="font-bold text-xs text-gray-800 dark:text-white">{ref.medicineName}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold">Predicted exhaustion: {ref.predictedRefillDate}</p>
                          </div>
                          <button
                            onClick={() => alert("Refill order drafted successfully and dispatched to Ms. Ahilya for SLMC-1045 clearing!")}
                            className="bg-[#22A06B] text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg shadow-xs hover:bg-[#1d8257] transition"
                          >
                            Refill Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order List */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Your Order Logs</h3>
                    <div className="space-y-3">
                      {orders.map(order => (
                        <div
                          key={order.id}
                          className="bg-white border p-4 rounded-2xl flex justify-between items-center gap-4 dark:bg-zinc-950 dark:border-zinc-900"
                        >
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold">ORDER ID: {order.id}</span>
                            <h4 className="font-bold text-xs text-gray-700 dark:text-white mt-0.5">Total: LKR {order.total}</h4>
                            <p className="text-[10px] text-gray-400">Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${order.status === OrderStatus.COMPLETED
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHARMACIST DASHBOARD */}
          {currentView === 'dashboard-pharmacist' && currentUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
              id="view-dashboard-pharmacist"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-2xl">Licensed Pharmacist Dashboard</h2>
                  <p className="text-xs text-gray-400">Dr. K. Gnanapragasam • SLMC-9842</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewMedCategory(categories[0]?.name || 'Antibiotics');
                    setShowAddMedModal(true);
                  }}
                  className="bg-[#22A06B] hover:bg-[#1c8055] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center space-x-1"
                >
                  <Pill className="w-4 h-4" />
                  <span>+ Add New Medicine</span>
                </button>
              </div>

              {/* Action column: Review prescriptions */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Awaiting Professional RX Clearance</h3>
                <div className="space-y-4">
                  {orders.filter(o => o.status === OrderStatus.WAITING_PHARMACIST).map(order => (
                    <div
                      key={order.id}
                      className="bg-white border border-gray-100 p-5 rounded-2xl dark:bg-zinc-950 dark:border-zinc-900 grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                      {/* Left: Patient and medicine detail */}
                      <div className="lg:col-span-8 space-y-3">
                        <div className="flex justify-between">
                          <span className="font-bold text-[#0F6CBD] text-sm">Order ID: {order.id}</span>
                          <span className="text-[10px] font-bold text-gray-400">PATIENT: {order.customerName}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono dark:bg-zinc-900">
                          {order.items.map(item => (
                            <div key={item.medicineId} className="flex justify-between">
                              <span>{item.name} ({item.strength}) x{item.quantity}</span>
                              <span>LKR {item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {order.ocrDetails && (
                          <div className="text-xs">
                            <span className="font-bold block text-amber-600">AI OCR EXTRACTED PRESCRIPTION INFO:</span>
                            <p className="text-gray-600 dark:text-gray-300">Doctor: {order.ocrDetails.doctorName} | Clinician Hospital: {order.ocrDetails.hospital}</p>
                            <p className="text-gray-600 dark:text-gray-300">Extracted Sig: "{order.ocrDetails.dosage}"</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="lg:col-span-4 flex flex-col justify-center space-y-2">
                        <button
                          onClick={() => approveOrder(order.id)}
                          className="w-full py-2 bg-[#22A06B] hover:bg-[#1d8257] text-white font-bold text-xs rounded-lg"
                        >
                          Clear &amp; Approve Order
                        </button>
                        <button
                          onClick={() => alert("Rejection report dispatched to patient.")}
                          className="w-full py-2 border text-red-600 font-semibold text-xs rounded-lg hover:bg-red-50"
                        >
                          Reject Prescription
                        </button>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.status === OrderStatus.WAITING_PHARMACIST).length === 0 && (
                    <div className="bg-emerald-50 text-[#22A06B] font-bold text-xs p-4 rounded-xl text-center">
                      No prescriptions are currently awaiting your professional review. Beautiful!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ADMIN DASHBOARD */}
          {currentView === 'dashboard-admin' && currentUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
              id="view-dashboard-admin"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-2xl">Admin Central Command</h2>
                  <p className="text-xs text-gray-400">Kaithady MediCare Hub Corporate Control</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewMedCategory(categories[0]?.name || 'Antibiotics');
                    setShowAddMedModal(true);
                  }}
                  className="bg-[#0F6CBD] hover:bg-[#0c599c] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center space-x-1"
                >
                  <Pill className="w-4 h-4" />
                  <span>+ Add New Medicine</span>
                </button>
              </div>

              {/* Stats bento panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border dark:bg-zinc-950 dark:border-zinc-900">
                  <span className="text-[10px] text-gray-400 block font-bold">TOTAL REVENUE LKR</span>
                  <span className="text-xl font-bold">Rs. 248,350</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border dark:bg-zinc-950 dark:border-zinc-900">
                  <span className="text-[10px] text-gray-400 block font-bold">TOTAL PATIENTS REGISTERED</span>
                  <span className="text-xl font-bold">3,120</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border dark:bg-zinc-950 dark:border-zinc-900">
                  <span className="text-[10px] text-gray-400 block font-bold">ACTIVE PHARMACISTS</span>
                  <span className="text-xl font-bold">2 Online</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border dark:bg-zinc-950 dark:border-zinc-900 bg-amber-50 dark:bg-zinc-950">
                  <span className="text-[10px] text-[#F59E0B] block font-bold">PENDING APPROVALS</span>
                  <span className="text-xl font-bold text-[#F59E0B]">0 Rx</span>
                </div>
              </div>

              {/* Audit logs */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">System Audit Logs</h3>
                <div className="bg-white dark:bg-zinc-950 border rounded-2xl overflow-hidden p-4 space-y-2 max-h-[250px] overflow-y-auto">
                  {activityLogs.map(log => (
                    <div key={log.id} className="text-xs flex justify-between py-1.5 border-b border-gray-50 last:border-none font-mono">
                      <span className="text-[#0F6CBD] font-bold">[{log.userRole}] {log.userName}:</span>
                      <span className="text-gray-600 dark:text-gray-300 flex-1 px-4">{log.action} - {log.details}</span>
                      <span className="text-gray-400 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <Footer currentLang={currentLang} accessibility={accessibility} setView={setView} />

      {/* LOGIN & SIGNUP MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className={`w-full ${authMode === 'register' ? 'max-w-md' : 'max-w-sm'} rounded-3xl p-6 shadow-xl border max-h-[90vh] overflow-y-auto ${accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white text-gray-800 border-gray-100 dark:bg-zinc-950 dark:border-zinc-900'
            }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Kaithady MediCare Hub Portal</h3>
                <p className="text-xs text-gray-400">Access your custom dashboard safely</p>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="p-1 hover:bg-gray-100 rounded-lg dark:hover:bg-zinc-800 text-gray-400">
                <span>✕</span>
              </button>
            </div>

            {/* Login / Register Tab Header */}
            <div className="flex border-b border-gray-100 dark:border-zinc-850 mb-4">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 pb-2.5 text-center font-bold text-xs transition-all border-b-2 ${authMode === 'login'
                  ? 'border-[#0F6CBD] text-[#0F6CBD]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 pb-2.5 text-center font-bold text-xs transition-all border-b-2 ${authMode === 'register'
                  ? 'border-[#0F6CBD] text-[#0F6CBD]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">SELECT YOUR ROLE</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Customer', 'Pharmacist', 'Admin'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setAuthRole(role as UserRole)}
                      className={`py-2 text-[10px] font-bold rounded-xl border text-center transition ${authRole === role
                        ? 'border-[#0F6CBD] bg-[#F5FAFF] text-[#0F6CBD] dark:bg-zinc-900 dark:text-sky-400'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                        }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g., Gishor Srilanka"
                    className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder={authRole === 'Admin' ? 'admin@gishor.com' : authRole === 'Pharmacist' ? 'pharmacist@gishor.com' : 'customer@gishor.com'}
                  className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  required
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-gray-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="e.g., +94771234567"
                      className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                      required
                    />
                  </div>

                  {authRole === UserRole.CUSTOMER && (
                    <>
                      <div>
                        <label className="block text-gray-400 mb-1">Delivery Address</label>
                        <input
                          type="text"
                          value={regAddress}
                          onChange={e => setRegAddress(e.target.value)}
                          placeholder="No 45, Temple Road, Jaffna"
                          className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Known Allergies (Comma-separated)</label>
                        <input
                          type="text"
                          value={regAllergies}
                          onChange={e => setRegAllergies(e.target.value)}
                          placeholder="e.g., Penicillin, Aspirin"
                          className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Chronic Conditions (Comma-separated)</label>
                        <input
                          type="text"
                          value={regConditions}
                          onChange={e => setRegConditions(e.target.value)}
                          placeholder="e.g., Diabetes, Hypertension"
                          className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                        />
                      </div>
                    </>
                  )}

                  {authRole === UserRole.PHARMACIST && (
                    <>
                      <div>
                        <label className="block text-gray-400 mb-1">Pharmacy License Number (SLMC)</label>
                        <input
                          type="text"
                          value={regLicense}
                          onChange={e => setRegLicense(e.target.value)}
                          placeholder="e.g., SLMC-9842"
                          className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                          required
                        />
                      </div>
                    </>
                  )}

                  {authRole === UserRole.ADMIN && (
                    <>
                      <div>
                        <label className="block text-amber-600 font-bold mb-1">Admin Access Code (Demo Key: ADMIN123)</label>
                        <input
                          type="text"
                          value={regAdminKey}
                          onChange={e => setRegAdminKey(e.target.value)}
                          placeholder="Enter admin authorization key"
                          className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border border-amber-300 dark:border-amber-800 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                          required
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {authError && <p className="text-red-500 font-bold">{authError}</p>}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0F6CBD] hover:bg-[#0c599c] text-white font-bold rounded-xl shadow-xs transition"
                id="auth-submit-button"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-900 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-xs text-[#0F6CBD] font-bold hover:underline"
              >
                {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>

            {authMode === 'login' && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-900 text-[10px] text-gray-400 text-center space-y-1">
                <p>Demo Logins (password: <strong>password</strong>):</p>
                <p>Customer: <strong>customer@gishor.com</strong></p>
                <p>Pharmacist: <strong>pharmacist@gishor.com</strong></p>
                <p>Admin: <strong>admin@gishor.com</strong></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD MEDICINE MODAL */}
      {showAddMedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-xl border max-h-[90vh] overflow-y-auto ${accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white text-gray-800 border-gray-100 dark:bg-zinc-950 dark:border-zinc-900'
            }`}>
            <div className="flex justify-between items-start mb-4 border-b pb-3 border-gray-100 dark:border-zinc-900">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add Medicine to Store</h3>
                <p className="text-xs text-gray-400">Introduce a new product to Kaithady MediCare Hub's catalog</p>
              </div>
              <button
                onClick={() => {
                  setShowAddMedModal(false);
                  setAddMedError('');
                  setAddMedSuccess('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg dark:hover:bg-zinc-800 text-gray-400"
              >
                <span>✕</span>
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4 text-xs">

              {addMedSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 text-center">
                  {addMedSuccess}
                </div>
              )}

              {addMedError && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold p-3 rounded-xl border border-red-200 dark:border-red-900 text-center">
                  {addMedError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Medicine Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={e => setNewMedName(e.target.value)}
                    placeholder="e.g., Amoxil"
                    className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Generic / Chemical Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newMedGeneric}
                    onChange={e => setNewMedGeneric(e.target.value)}
                    placeholder="e.g., Amoxicillin"
                    className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Category <span className="text-red-500">*</span></label>
                  <select
                    value={newMedCategory}
                    onChange={e => setNewMedCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {!categories.some(c => c.name === 'Antibiotics') && <option value="Antibiotics">Antibiotics</option>}
                    {!categories.some(c => c.name === 'Painkillers') && <option value="Painkillers">Painkillers</option>}
                    {!categories.some(c => c.name === 'Cardiology') && <option value="Cardiology">Cardiology</option>}
                    {!categories.some(c => c.name === 'Diabetic') && <option value="Diabetic">Diabetic</option>}
                    {!categories.some(c => c.name === 'Vitamins') && <option value="Vitamins">Vitamins</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Price (LKR) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newMedPrice}
                    onChange={e => setNewMedPrice(Number(e.target.value))}
                    placeholder="e.g., 250"
                    className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Strength <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newMedStrength}
                    onChange={e => setNewMedStrength(e.target.value)}
                    placeholder="e.g., 500mg or 250mg/5ml"
                    className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Initial Stock <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newMedStock}
                    onChange={e => setNewMedStock(Number(e.target.value))}
                    placeholder="e.g., 100"
                    className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMedRequiresRx}
                      onChange={e => setNewMedRequiresRx(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0F6CBD] focus:ring-[#0F6CBD] dark:bg-zinc-900 dark:border-zinc-800"
                    />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Requires Prescription (Rx Required)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Short Description <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  value={newMedDesc}
                  onChange={e => setNewMedDesc(e.target.value)}
                  placeholder="e.g., Broad-spectrum bactericidal penicillin antibiotic for bacterial infections."
                  className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD] resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Clinical Usage Instructions <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  value={newMedUsage}
                  onChange={e => setNewMedUsage(e.target.value)}
                  placeholder="e.g., Take 1 tablet every 8 hours with or after meals. Complete the course."
                  className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD] resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Contraindications &amp; Warnings</label>
                <input
                  type="text"
                  value={newMedWarnings}
                  onChange={e => setNewMedWarnings(e.target.value)}
                  placeholder="e.g., Avoid if allergic to penicillin. Seek advice on pregnancy."
                  className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Known Side Effects (Comma-separated)</label>
                <input
                  type="text"
                  value={newMedSideEffects}
                  onChange={e => setNewMedSideEffects(e.target.value)}
                  placeholder="e.g., Nausea, Diarrhea, Skin rash"
                  className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Medicine Image URL</label>
                <input
                  type="url"
                  value={newMedImage}
                  onChange={e => setNewMedImage(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                />
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-gray-400 block font-bold">PRESET THEMES FOR EASY SELECTION:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "💊 Tablets Pack", url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=60" },
                      { label: "🧪 Syrup Liquid", url: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop&q=60" },
                      { label: "🫙 Capsules Container", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60" },
                      { label: "🌬️ Asthma Inhaler", url: "https://images.unsplash.com/photo-1607619056574-7b8d304f3b24?w=400&auto=format&fit=crop&q=60" }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewMedImage(preset.url)}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition ${newMedImage === preset.url
                          ? 'bg-[#0F6CBD] border-[#0F6CBD] text-white'
                          : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMedModal(false);
                    setAddMedError('');
                    setAddMedSuccess('');
                  }}
                  className="flex-1 py-2 border text-gray-500 font-semibold rounded-xl text-center hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMed}
                  className="flex-1 py-2 bg-[#0F6CBD] hover:bg-[#0c599c] text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1 disabled:opacity-50"
                >
                  {isSubmittingMed ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Medicine</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedMed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setSelectedMed(null); }}
        >
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-xl border max-h-[90vh] overflow-y-auto ${accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white text-gray-800 border-gray-100'
            }`}>
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 id="modal-product-title" className="font-bold text-base text-gray-900 dark:text-white">{selectedMed.name}</h3>
                  {selectedMed.manufacturer && (
                    <span className="text-[10px] bg-blue-50 text-[#0F6CBD] dark:bg-zinc-800 dark:text-sky-400 px-2 py-0.5 rounded-full font-semibold border border-blue-100 dark:border-zinc-700">
                      {selectedMed.manufacturer}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 italic">Gen: {selectedMed.genericName}</p>
              </div>
              <button 
                onClick={() => setSelectedMed(null)} 
                className="p-1 hover:bg-gray-100 rounded-lg dark:hover:bg-zinc-800 text-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD]"
                aria-label="Close product details dialog"
              >
                <span>✕</span>
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              {/* Main Zoomable Image View */}
              <div className="space-y-2">
                <div className="h-56 rounded-2xl overflow-hidden bg-gray-50 relative group image-zoom-container border border-gray-100 dark:border-zinc-800">
                  <img
                    src={(selectedMed.images && selectedMed.images[selectedImageIndex]) || selectedMed.image}
                    alt={`${selectedMed.name} - View ${selectedImageIndex + 1}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 cursor-zoom-in group-hover:scale-125"
                  />
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded-md pointer-events-none">
                    🔍 Hover to Zoom
                  </span>
                  {selectedMed.manufacturerLogo && (
                    <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-zinc-900/90 p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center space-x-1 shadow-xs">
                      <img src={selectedMed.manufacturerLogo} alt={selectedMed.manufacturer || 'Manufacturer'} className="w-5 h-5 object-contain" />
                      <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300">{selectedMed.manufacturer || 'Brand'}</span>
                    </div>
                  )}
                </div>

                {/* Multi-angle Thumbnail Selection Strip */}
                {selectedMed.images && selectedMed.images.length > 1 && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">MULTIPLE ANGLE VIEWS:</span>
                    <div className="flex gap-2" role="group" aria-label="Product image angle options">
                      {selectedMed.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                            selectedImageIndex === idx
                              ? 'border-[#0F6CBD] shadow-md scale-105'
                              : 'border-gray-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                          }`}
                          aria-label={`View image angle ${idx + 1}`}
                          aria-pressed={selectedImageIndex === idx}
                        >
                          <img src={imgUrl} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <strong className="text-gray-400 block mb-0.5">USAGE &amp; SIG DETAILS:</strong>
                <p className="text-gray-700 dark:text-gray-200">{selectedMed.usageInstructions}</p>
              </div>

              <div>
                <strong className="text-gray-400 block mb-0.5">WARNINGS &amp; CONTRAINDICATIONS:</strong>
                <p className="text-amber-600 dark:text-amber-400 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-100 dark:bg-zinc-900 dark:border-zinc-800">
                  {selectedMed.warnings}
                </p>
              </div>

              <div>
                <strong className="text-gray-400 block mb-0.5">KNOWN SIDE EFFECTS:</strong>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">
                  {selectedMed.sideEffects.map(se => (
                    <li key={se}>{se}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">LKR PRICE</span>
                  <span className="text-sm font-bold text-[#0F6CBD]">Rs. {selectedMed.price}</span>
                </div>
                <button
                  onClick={() => { addToCart(selectedMed); setSelectedMed(null); }}
                  className="bg-[#0F6CBD] hover:bg-[#0c599c] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD]"
                  aria-label={`Add ${selectedMed.name} to shopping cart`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
