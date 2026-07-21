import React, { useState, useEffect } from 'react';
import { 
  Pill, Search, Star, Heart, ShoppingBag, ArrowRight, ShieldCheck, 
  MapPin, Clock, MessageSquare, AlertCircle, Calendar, FileText, CheckCircle, 
  Trash2, User, ChevronRight, TrendingUp, Users, ClipboardList, Settings, 
  AlertTriangle, RefreshCw, Layers, PhoneCall, Video, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import DrugInteractionChecker from './components/DrugInteractionChecker';
import PrescriptionUpload from './components/PrescriptionUpload';
import VoiceSearch from './components/VoiceSearch';
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
    let text = `*GISHOR PHARMACY ORDER REQUEST*\n`;
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
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${
      accessibility.highContrast ? 'bg-black text-white' : 'bg-[#F5FAFF]'
    }`}>
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl p-6 lg:p-10 border border-gray-100 shadow-sm relative overflow-hidden dark:bg-zinc-950 dark:border-zinc-900">
                <div className="lg:col-span-7 flex flex-col justify-center space-y-5 z-10">
                  <span className="bg-[#F5FAFF] text-[#0F6CBD] font-bold text-xs uppercase px-3.5 py-1.5 rounded-full inline-block self-start dark:bg-zinc-900 dark:text-blue-300">
                    🏥 Certified Sri Lankan Pharmacy
                  </span>
                  <h2 className={`font-bold tracking-tight text-gray-900 leading-tight dark:text-white ${
                    accessibility.largeText ? 'text-4xl' : 'text-3xl lg:text-4xl'
                  }`}>
                    Your Trusted clinical <br />
                    Pharmacy platform in <span className="text-[#0F6CBD]">Jaffna</span>
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
                    Order Over-The-Counter medicines safely, upload prescriptions for vision-driven AI order drafting, check compound safety, and secure calendar video consultations with licensed pharmacists.
                  </p>
                  
                  {/* Global search input */}
                  <div className="bg-gray-50 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl p-2.5 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 max-w-xl">
                    <div className="flex-1 flex items-center space-x-2 px-2.5">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-xs text-gray-700 w-full focus:outline-none dark:text-white"
                        id="hero-medicine-search-input"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <VoiceSearch 
                        currentLang={currentLang} 
                        accessibility={accessibility} 
                        onSpeechResult={(word) => {
                          setSearchQuery(word);
                          setView('shop');
                        }} 
                      />
                      <button
                        onClick={() => setView('shop')}
                        className="bg-[#0F6CBD] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#0c599c] transition shadow-xs flex items-center space-x-1"
                      >
                        <span>{t.btnSearch}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-gray-500">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-[#22A06B]" />
                      <span>SLMC No. 9842</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-[#22A06B]" />
                      <span>Cash on Delivery</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-[#22A06B]" />
                      <span>WhatsApp Ordering</span>
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
                  <div className="relative">
                    <div className="w-[340px] h-[340px] rounded-3xl overflow-hidden shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
                        alt="Gishor Pharmacy clinical counter"
                        referrerPolicy="no-referrer"
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
                        <span className="text-xs font-extrabold text-gray-800 dark:text-white">Pharmacist Validated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main functional split: Chat assistant + Prescription vision upload */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* AI Assistant Chat column */}
                <div className="lg:col-span-7">
                  <AIAssistant currentLang={currentLang} accessibility={accessibility} />
                </div>

                {/* Prescription visión ocr column */}
                <div className="lg:col-span-5 space-y-6">
                  <PrescriptionUpload 
                    currentLang={currentLang} 
                    accessibility={accessibility} 
                    onOrderDraftCreated={handleOCRReceived} 
                  />

                  {/* Quick Drug interaction checker widget */}
                  <DrugInteractionChecker currentLang={currentLang} accessibility={accessibility} />
                </div>
              </div>

              {/* Categories Section */}
              <div className="space-y-4">
                <h3 className={`font-bold text-gray-900 dark:text-white ${accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                  {t.categories}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.name); setView('shop'); }}
                      className="bg-white border border-gray-100 dark:bg-zinc-950 dark:border-zinc-900 p-4 rounded-2xl shadow-xs text-center cursor-pointer hover:border-[#0F6CBD] hover:shadow-md transition"
                    >
                      <span className="text-2xl block mb-2">💊</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F3FCF8] p-6 rounded-3xl dark:bg-zinc-950 border border-emerald-100 dark:border-zinc-900">
                <div className="p-4 space-y-2">
                  <span className="text-2xl">👴</span>
                  <p className="text-xs italic text-gray-600 dark:text-gray-300 font-medium">"Using the Large Text and Sinhala language features is so easy. Gishor predicts my Metformin refills and reminds me through WhatsApp."</p>
                  <span className="text-[10px] font-bold text-gray-400 block">- Mr. Sunil Herath, Chronic Patient</span>
                </div>
                <div className="p-4 space-y-2 border-l border-emerald-200 dark:border-zinc-800">
                  <span className="text-2xl">👩‍👦</span>
                  <p className="text-xs italic text-gray-600 dark:text-gray-300 font-medium">"I uploaded my child's antibiotics prescription image. The AI vision parsed it instantly, created a draft order, and a licensed pharmacist cleared it within minutes."</p>
                  <span className="text-[10px] font-bold text-gray-400 block">- Mrs. V. Tharmika, Parent</span>
                </div>
                <div className="p-4 space-y-2 border-l border-emerald-200 dark:border-zinc-800">
                  <span className="text-2xl">🩺</span>
                  <p className="text-xs italic text-gray-600 dark:text-gray-300 font-medium">"Excellent clinical standards. Gishor drug interaction checker is powered by Gemini, giving accurate warning lights on anticoagulant risks."</p>
                  <span className="text-[10px] font-bold text-gray-400 block">- Dr. S. Kugan, Jaffna Clinician</span>
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
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                        selectedCategory === cat
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
                        <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                          LKR {med.price}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{med.category}</span>
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
                          onClick={() => setSelectedMed(med)}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition"
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
                  Gishor Pharmacy was established in Jaffna in 2014 to serve the unique health concerns of local families, diabetic patients, and the elderly. Operating under licensed SLMC certifications, we combine human care with secure digital AI vision systems to guarantee dosage safety.
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
                                className={`p-2.5 text-xs rounded-xl font-bold border text-left transition ${
                                  paymentMethod === m 
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
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            order.status === OrderStatus.COMPLETED
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
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-2xl">Licensed Pharmacist Dashboard</h2>
                  <p className="text-xs text-gray-400">Dr. K. Gnanapragasam • SLMC-9842</p>
                </div>
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
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-2xl">Admin Central Command</h2>
                  <p className="text-xs text-gray-400">Gishor Pharmacy Corporate Control</p>
                </div>
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
      <Footer currentLang={currentLang} accessibility={accessibility} />

      {/* LOGIN & SIGNUP MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className={`w-full ${authMode === 'register' ? 'max-w-md' : 'max-w-sm'} rounded-3xl p-6 shadow-xl border max-h-[90vh] overflow-y-auto ${
            accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white text-gray-800 border-gray-100 dark:bg-zinc-950 dark:border-zinc-900'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Gishor Pharmacy Portal</h3>
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
                className={`flex-1 pb-2.5 text-center font-bold text-xs transition-all border-b-2 ${
                  authMode === 'login' 
                    ? 'border-[#0F6CBD] text-[#0F6CBD]' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 pb-2.5 text-center font-bold text-xs transition-all border-b-2 ${
                  authMode === 'register' 
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
                      className={`py-2 text-[10px] font-bold rounded-xl border text-center transition ${
                        authRole === role 
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

      {/* DETAIL MODAL */}
      {selectedMed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-xl border max-h-[90vh] overflow-y-auto ${
            accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white text-gray-800 border-gray-100'
          }`}>
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{selectedMed.name}</h3>
                <p className="text-xs text-gray-400 italic">Gen: {selectedMed.genericName}</p>
              </div>
              <button onClick={() => setSelectedMed(null)} className="p-1 hover:bg-gray-100 rounded-lg dark:hover:bg-zinc-800">
                <span>✕</span>
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="h-44 rounded-xl overflow-hidden bg-gray-50">
                <img
                  src={selectedMed.image}
                  alt={selectedMed.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
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
                  className="bg-[#0F6CBD] hover:bg-[#0c599c] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs"
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
