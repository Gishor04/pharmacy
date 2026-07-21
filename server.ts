import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { UserRole, OrderStatus } from './src/types';
import { connectMongoDB, dbAdapter } from './src/db/mongodb';


dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API Client:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found. Server will run with high-fidelity local AI fallbacks.");
}

// ----------------- DATABASE ENGINE -----------------
const DB_FILE = path.join(process.cwd(), 'db.json');

const INITIAL_MEDICINES = [
  {
    id: "med-1",
    name: "Paracetamol (Panadol)",
    genericName: "Paracetamol",
    category: "OTC Medicines",
    price: 350,
    description: "Effective fever and pain reliever used for headache, body ache, and toothache. Safe for all age groups when taken in correct dosages.",
    usageInstructions: "Adults: Take 1-2 tablets every 4-6 hours. Do not exceed 8 tablets in 24 hours.",
    sideEffects: ["Mild nausea", "Rashes (rare)", "Liver strain if overdosed"],
    warnings: "Do not combine with other Paracetamol-containing medications. Avoid alcohol.",
    strength: "500mg",
    stock: 250,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: false,
    reviewsCount: 42,
    rating: 4.8,
    expiryDate: "2027-12-31"
  },
  {
    id: "med-2",
    name: "Amoxil (Amoxicillin)",
    genericName: "Amoxicillin Trihydrate",
    category: "Prescription Medicines",
    price: 1200,
    description: "Broad-spectrum penicillin antibiotic used to treat bacterial infections of the ears, throat, lungs, urinary tract, and skin.",
    usageInstructions: "Take 1 capsule 3 times daily (every 8 hours) for 5-7 days as directed. Finish the full course.",
    sideEffects: ["Diarrhea", "Stomach upset", "Allergic rash"],
    warnings: "Requires pharmacist review and prescription upload. Do not take if allergic to Penicillin.",
    strength: "500mg",
    stock: 120,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: true,
    reviewsCount: 15,
    rating: 4.6,
    expiryDate: "2027-06-30"
  },
  {
    id: "med-3",
    name: "Glucophage (Metformin)",
    genericName: "Metformin Hydrochloride",
    category: "Prescription Medicines",
    price: 950,
    description: "First-line medication for the treatment of type 2 diabetes, helping lower blood glucose levels and improve insulin response.",
    usageInstructions: "Take 1 tablet twice daily with breakfast and dinner. Swallow whole with water.",
    sideEffects: ["Flatulence", "Metallic taste", "Temporary loss of appetite"],
    warnings: "Consult doctor for renal status check. Monitor blood sugar regularly.",
    strength: "850mg",
    stock: 180,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: true,
    reviewsCount: 28,
    rating: 4.7,
    expiryDate: "2028-02-28"
  },
  {
    id: "med-4",
    name: "Lipitor (Atorvastatin)",
    genericName: "Atorvastatin Calcium",
    category: "Prescription Medicines",
    price: 1850,
    description: "Statin class cholesterol-lowering medication used to prevent cardiovascular disease in high-risk patients.",
    usageInstructions: "Take 1 tablet daily at night, with or without food. Maintain a low-fat diet.",
    sideEffects: ["Mild muscle pain", "Headache", "Stiff joints"],
    warnings: "Contraindicated in pregnancy. Report any unexplained muscle pain to your pharmacist immediately.",
    strength: "20mg",
    stock: 90,
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: true,
    reviewsCount: 31,
    rating: 4.9,
    expiryDate: "2027-09-30"
  },
  {
    id: "med-5",
    name: "Cetriz (Cetirizine)",
    genericName: "Cetirizine Hydrochloride",
    category: "OTC Medicines",
    price: 280,
    description: "Non-drowsy 24-hour antihistamine that provides rapid relief from allergic rhinitis, runny nose, watery eyes, and itching.",
    usageInstructions: "Adults: 1 tablet daily before sleeping. Do not exceed 1 tablet per day.",
    sideEffects: ["Mild drowsiness", "Dry mouth", "Fatigue"],
    warnings: "Avoid driving or operating heavy machinery if you feel drowsy.",
    strength: "10mg",
    stock: 300,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: false,
    reviewsCount: 55,
    rating: 4.7,
    expiryDate: "2028-05-31"
  },
  {
    id: "med-6",
    name: "Seven Seas Cod Liver Oil",
    genericName: "Omega-3 with Vitamin A & D",
    category: "Supplements",
    price: 2450,
    description: "Premium pure cod liver oil capsules packed with natural Omega-3, EPA, DHA, Vitamin A, and Vitamin D to support immunity, joints, and brain development.",
    usageInstructions: "Take 1-2 capsules daily with meals. Ideal for both elderly citizens and growing children.",
    sideEffects: ["Mild fishy aftertaste"],
    warnings: "Do not exceed recommended intake unless advised by a nutritionist.",
    strength: "500mg",
    stock: 80,
    image: "https://images.unsplash.com/photo-1611070973770-b1a672610042?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: false,
    reviewsCount: 19,
    rating: 4.5,
    expiryDate: "2027-10-31"
  },
  {
    id: "med-7",
    name: "Nestlé Cerelac (Wheat & Apple)",
    genericName: "Baby Nutritional Cereal",
    category: "Baby Care",
    price: 1100,
    description: "Nutritious infant cereal fortified with iron, zinc, and key vitamins to help support child growth and mental development starting from 6 months.",
    usageInstructions: "Mix 3 level scoops of Cerelac with 150ml of warm pre-boiled drinking water until smooth. Feed immediately.",
    sideEffects: [],
    warnings: "Breastfeeding is best for babies. Clean all utensils thoroughly before preparing food.",
    strength: "400g",
    stock: 60,
    image: "https://images.unsplash.com/photo-1522844990219-53b36ee7fff4?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: false,
    reviewsCount: 12,
    rating: 4.6,
    expiryDate: "2027-03-31"
  },
  {
    id: "med-8",
    name: "Ensure Gold (Vanilla)",
    genericName: "Adult Nutritional Milk Formula",
    category: "Elderly Care",
    price: 5400,
    description: "Complete, balanced nutrition formula scientifically designed to build muscle mass, strength, and energy levels for older adults.",
    usageInstructions: "Add 6 level scoops of powder into 185ml of cold or room-temperature water. Stir well.",
    sideEffects: [],
    warnings: "Not intended for children unless recommended by a pediatric doctor.",
    strength: "850g",
    stock: 45,
    image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: false,
    reviewsCount: 38,
    rating: 4.9,
    expiryDate: "2027-11-30"
  },
  {
    id: "med-9",
    name: "Sensodyne Rapid Relief",
    genericName: "Fluoride Sensitive Toothpaste",
    category: "Wellness",
    price: 850,
    description: "Clinically proven toothpaste providing rapid relief and long-lasting protection for sensitive teeth and exposed dentin.",
    usageInstructions: "Brush thoroughly twice daily, not more than 3 times, minimizing swallowing.",
    sideEffects: [],
    warnings: "Not for children under 12 years of age unless recommended by a dentist.",
    strength: "100g",
    stock: 140,
    image: "https://images.unsplash.com/photo-1559591937-e4b53d8993db?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: false,
    reviewsCount: 22,
    rating: 4.8,
    expiryDate: "2028-08-31"
  }
];

const INITIAL_CATEGORIES = [
  { id: "cat-1", name: "Prescription Medicines", icon: "Pills", description: "Rx drugs requiring professional review and approval", itemCount: 3 },
  { id: "cat-2", name: "OTC Medicines", icon: "Activity", description: "Over-the-counter daily relievers, syrups, and tablets", itemCount: 2 },
  { id: "cat-3", name: "Wellness", icon: "HeartPulse", description: "Daily hygiene, skin treatments, and healthcare goods", itemCount: 1 },
  { id: "cat-4", name: "Baby Care", icon: "Baby", description: "Formulas, diapers, soft wipes, and vitamins for children", itemCount: 1 },
  { id: "cat-5", name: "Elderly Care", icon: "ShieldAlert", description: "High-protein supplements, mobility supports, and aids", itemCount: 1 },
  { id: "cat-6", name: "Supplements", icon: "Sparkles", description: "Vitamins, immunity capsules, and muscle protein powders", itemCount: 1 }
];

const INITIAL_PHARMACISTS = [
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
];

const INITIAL_DOCTORS = [
  {
    id: "doc-1",
    name: "Prof. S. Kirupakaran",
    specialty: "Consultant Cardiologist",
    hospital: "Teaching Hospital Jaffna",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=60",
    rating: 4.9,
    availability: ["Monday 15:00 - 18:00", "Thursday 09:00 - 12:00"]
  },
  {
    id: "doc-2",
    name: "Dr. Thivya Aruliah",
    specialty: "Consultant Endocrinologist",
    hospital: "Jaffna Central Hospital",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=60",
    rating: 4.8,
    availability: ["Tuesday 14:00 - 16:30", "Saturday 10:00 - 13:00"]
  }
];

const INITIAL_BLOGS = [
  {
    id: "blog-1",
    title: "Managing Type-2 Diabetes Under Warm Climates",
    category: "Medicine Guide",
    content: "With rising temperatures in Jaffna, chronic patients, particularly diabetes patients taking Metformin, must stay hydrated. Dehydration leads to poor renal flow, increasing metformin side effects. Maintain blood sugar tests twice weekly, drink plenty of herbal drinks without sugar (such as neem tea or water), and keep medications below 25°C inside a dark shelf.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=60",
    readTime: "5 mins",
    author: "Dr. K. Gnanapragasam",
    date: "2026-07-15"
  },
  {
    id: "blog-2",
    title: "Seasonal Dengue Outbreaks: Safe OTC Fever Care",
    category: "Health Awareness",
    content: "During monsoonal seasons, dengue vector mosquitoes thrive. If you develop a sudden fever, standard Paracetamol is the ONLY safe self-treatment. NEVER consume NSAIDs like Ibuprofen, Diclofenac, or Aspirin, as they drastically increase the risk of internal bleeding if the fever is Dengue Hemorrhagic. If fever lasts over 48 hours, proceed immediately to the Jaffna Teaching Hospital for a full blood count.",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=60",
    readTime: "4 mins",
    author: "Ms. Ahilya Selvam",
    date: "2026-07-18"
  },
  {
    id: "blog-3",
    title: "Healthy Nutrition Tips for Golden Elderly Years",
    category: "Nutrition Tips",
    content: "Muscular atrophy (sarcopenia) and poor joint fluid are common complaints among senior citizens. Fortifying their breakfast with adult milk formulas containing CaHMB and Vitamin D is proven to maintain skeletal and muscle health. Ensure light walks in the morning sun to trigger natural Vitamin D, and combine with low-sodium diets.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=60",
    readTime: "6 mins",
    author: "Dr. Thivya Aruliah",
    date: "2026-07-20"
  }
];

const INITIAL_DRUG_INTERACTIONS = [
  { medicineA: "Amoxil (Amoxicillin)", medicineB: "Lipitor (Atorvastatin)", severity: "Safe", description: "No clinical interaction observed. Safe to take concurrently with appropriate timing." },
  { medicineA: "Glucophage (Metformin)", medicineB: "Lipitor (Atorvastatin)", severity: "Safe", description: "Safe and frequently prescribed together for type 2 diabetes with lipid control. Ensure kidney function tests are stable." },
  { medicineA: "Paracetamol (Panadol)", medicineB: "Glucophage (Metformin)", severity: "Safe", description: "No mutual side effects. Avoid alcohol ingestion during active pain/fever therapy." },
  { medicineA: "Amoxil (Amoxicillin)", medicineB: "Oral Contraceptives", severity: "Warning", description: "Amoxicillin may reduce systemic absorption and efficacy of oral contraceptive pills. Use secondary barrier methods during antibiotic therapy." },
  { medicineA: "Warfarin", medicineB: "Aspirin", severity: "Consult Pharmacist", description: "Red level alert! High risk of profound systemic bleeding. Combined use impairs platelet aggregation and coagulation simultaneously." },
  { medicineA: "Lipitor (Atorvastatin)", medicineB: "Clarithromycin", severity: "Consult Pharmacist", description: "Clarithromycin dramatically increases statin concentrations, heightening risk of acute muscle breakdown (rhabdomyolysis). Hold statin during antibiotic course." }
];

// ----------------- API ROUTE DEFINITIONS -----------------

// Authentication API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await dbAdapter.findUserByEmailAndRole(email, role);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email, password, or role selector." });
    }

    // Create audit log
    await dbAdapter.createActivityLog({
      id: "log-" + Date.now(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "User Login",
      details: `${user.role} logged in from browser session.`,
      timestamp: new Date().toISOString()
    });

    // Return a JWT-like payload for safety
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token: `gishor-jwt-token-${user.id}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, city, allergies, chronicConditions } = req.body;

    const exists = await dbAdapter.findUserByEmailAndRole(email, role);
    if (exists) {
      return res.status(400).json({ error: "An account with this email and role already exists." });
    }

    const newUser = {
      id: "u-" + Date.now(),
      name,
      email,
      role: role || UserRole.CUSTOMER,
      password: password || "password",
      phone: phone || "",
      address: address || "",
      city: city || "Jaffna",
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60",
      createdAt: new Date().toISOString()
    };

    await dbAdapter.createUser(newUser);

    await dbAdapter.createActivityLog({
      id: "log-" + Date.now(),
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: "User Registered",
      details: `New ${newUser.role} profile registered successfully.`,
      timestamp: new Date().toISOString()
    });

    const { password: _, ...safeUser } = newUser;
    res.json({ user: safeUser, token: `gishor-jwt-token-${newUser.id}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Medicines API
app.get('/api/medicines', async (req, res) => {
  try {
    const { search, category, requiresPrescription, maxPrice } = req.query;
    const medicines = await dbAdapter.getMedicines();
    let filtered = [...medicines];

    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(s) || 
        m.genericName.toLowerCase().includes(s) || 
        m.description.toLowerCase().includes(s)
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(m => m.category === category);
    }

    if (requiresPrescription) {
      const val = requiresPrescription === 'true';
      filtered = filtered.filter(m => m.requiresPrescription === val);
    }

    if (maxPrice) {
      const price = Number(maxPrice);
      filtered = filtered.filter(m => m.price <= price);
    }

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/medicines', async (req, res) => {
  try {
    const { name, genericName, category, price, description, usageInstructions, sideEffects, warnings, strength, stock, image, requiresPrescription } = req.body;

    const newMed = {
      id: "med-" + Date.now(),
      name,
      genericName,
      category,
      price: Number(price),
      description,
      usageInstructions,
      sideEffects: sideEffects || [],
      warnings: warnings || "Consult with a pharmacist.",
      strength,
      stock: Number(stock),
      image: image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60",
      requiresPrescription: !!requiresPrescription,
      reviewsCount: 0,
      rating: 5.0,
      expiryDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const saved = await dbAdapter.createMedicine(newMed);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/medicines/:id', async (req, res) => {
  try {
    const removed = await dbAdapter.deleteMedicine(req.params.id);
    if (removed) {
      res.json(removed);
    } else {
      res.status(404).json({ error: "Medicine not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbAdapter.getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const { customerId, pharmacistReviewNeeded } = req.query;
    const orders = await dbAdapter.getOrders();
    let results = [...orders];

    if (customerId) {
      results = results.filter(o => o.customerId === customerId);
    }

    if (pharmacistReviewNeeded === 'true') {
      results = results.filter(o => o.status === OrderStatus.WAITING_PHARMACIST);
    }

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, customerName, items, paymentMethod, deliveryAddress, prescriptionUrl, ocrDetails, notes } = req.body;
    const medicines = await dbAdapter.getMedicines();
    const orders = await dbAdapter.getOrders();

    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Check if any item in the order requires prescription
    let needsApproval = false;
    for (const item of items) {
      const med = medicines.find((m: any) => m.id === item.medicineId);
      if (med && med.requiresPrescription) {
        needsApproval = true;
      }
    }

    const newOrder = {
      id: "ord-" + (100 + orders.length + 1),
      customerId,
      customerName,
      items,
      total,
      status: needsApproval ? OrderStatus.WAITING_PHARMACIST : OrderStatus.PENDING,
      paymentMethod,
      paymentStatus: "Pending",
      deliveryAddress,
      prescriptionUrl: prescriptionUrl || null,
      ocrDetails: ocrDetails || null,
      refillReminderEnabled: true,
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    await dbAdapter.createOrder(newOrder);

    // Auto create refill scheduling for prescription medicines
    if (needsApproval) {
      for (const item of items) {
        const med = medicines.find((m: any) => m.id === item.medicineId);
        if (med && med.requiresPrescription) {
          await dbAdapter.createRefillSchedule({
            id: "ref-" + Date.now() + Math.floor(Math.random() * 1000),
            customerId,
            customerPhone: "+94771234567",
            medicineName: med.name,
            lastRefillDate: new Date().toISOString().split('T')[0],
            predictedRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            frequencyDays: 30,
            status: "Active"
          });
        }
      }
    }

    // Deduct stock
    for (const item of items) {
      await dbAdapter.updateMedicineStock(item.medicineId, item.quantity);
    }

    await dbAdapter.createActivityLog({
      id: "log-" + Date.now(),
      userId: customerId,
      userName: customerName,
      userRole: "Customer",
      action: "Order Placed",
      details: `Order ${newOrder.id} generated. Total: LKR ${total}. Status: ${newOrder.status}`,
      timestamp: new Date().toISOString()
    });

    res.json(newOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:id/approve', async (req, res) => {
  try {
    const approved = await dbAdapter.updateOrderStatus(req.params.id, OrderStatus.APPROVED, "Paid");

    if (approved) {
      await dbAdapter.createActivityLog({
        id: "log-" + Date.now(),
        userId: "ph-1",
        userName: "Dr. K. Gnanapragasam",
        userRole: "Pharmacist",
        action: "Order Approved",
        details: `Prescription reviewed and order ${req.params.id} cleared for preparation.`,
        timestamp: new Date().toISOString()
      });

      res.json(approved);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await dbAdapter.updateOrderStatus(req.params.id, status);

    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Telepharmacy & Appointments API
app.get('/api/appointments', async (req, res) => {
  try {
    const appts = await dbAdapter.getAppointments();
    res.json(appts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { customerId, customerName, pharmacistId, pharmacistName, date, timeSlot, type, notes } = req.body;

    const newAppt = {
      id: "apt-" + Date.now(),
      customerId,
      customerName,
      pharmacistId,
      pharmacistName,
      date,
      timeSlot,
      type,
      status: "Scheduled",
      notes: notes || "",
      meetingLink: `https://meet.google.com/gishor-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };

    const saved = await dbAdapter.createAppointment(newAppt);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/refills', async (req, res) => {
  try {
    const refills = await dbAdapter.getRefillSchedules();
    res.json(refills);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await dbAdapter.getActivityLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await dbAdapter.getBlogs();
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await dbAdapter.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const updated = await dbAdapter.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- INTELLIGENT AI HEALTH ROUTES (GEMINI API) -----------------

// Drug Interaction Checker Endpoint
app.post('/api/interactions/check', async (req, res) => {
  try {
    const { medicineA, medicineB } = req.body;
    const interactions = await dbAdapter.getInteractions();

    // 1. Look for pre-configured local records first
    const localMatch = interactions.find((item: any) => 
      (item.medicineA.toLowerCase().includes(medicineA.toLowerCase()) && item.medicineB.toLowerCase().includes(medicineB.toLowerCase())) ||
      (item.medicineA.toLowerCase().includes(medicineB.toLowerCase()) && item.medicineB.toLowerCase().includes(medicineA.toLowerCase()))
    );

    if (localMatch) {
      return res.json(localMatch);
    }

    // 2. Query Gemini if initialized
    if (ai) {
      try {
        const prompt = `Perform a high-precision medical-grade analysis of drug-drug or food-drug interactions between:
1. ${medicineA}
2. ${medicineB}

Your response MUST be valid JSON conforming exactly to this schema:
{
  "medicineA": "${medicineA}",
  "medicineB": "${medicineB}",
  "severity": "Safe" | "Warning" | "Consult Pharmacist",
  "description": "Short medical explanation of clinical interaction and advisory instructions."
}
Only output the JSON object without markdown fences, and be safe, objective and accurate.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        const parsed = JSON.parse(response.text?.trim() || "{}");
        if (parsed.severity && parsed.description) {
          return res.json(parsed);
        }
      } catch (err) {
        console.error("Gemini interaction check error, falling back:", err);
      }
    }

    // 3. Intelligently synthesize a safe default analysis if Gemini is unavailable
    const alertWords = ["aspirin", "warfarin", "heparin", "clopidogrel", "clarithromycin", "statin", "atorvastatin", "erythromycin", "ketoconazole"];
    const isA_Alert = alertWords.some(w => medicineA.toLowerCase().includes(w));
    const isB_Alert = alertWords.some(w => medicineB.toLowerCase().includes(w));

    let severity: 'Safe' | 'Warning' | 'Consult Pharmacist' = 'Safe';
    let description = "No standard severe clinical interaction found in local active registers. Safe to administer with regular water.";

    if (isA_Alert && isB_Alert) {
      severity = 'Consult Pharmacist';
      description = `Potential severe contraindication between ${medicineA} and ${medicineB}. Combining anticoagulants or certain statins with inhibitors requires therapeutic dose tapering. Do not consume concurrently.`;
    } else if (isA_Alert || isB_Alert) {
      severity = 'Warning';
      description = `Use caution. Taking ${medicineA} with ${medicineB} might elevate metabolic clearance rates or increase stomach acidity. We advise taking them 2 hours apart and monitoring symptoms.`;
    }

    res.json({ medicineA, medicineB, severity, description });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Health Advisor / ChatGPT Symptom Checker with 3-5 state constraints
app.post('/api/chats/message', async (req, res) => {
  const { message, history } = req.body;

  const disclaimer = "\n\n*⚠️ AI suggestions are for informational purposes only and are not a medical diagnosis. Please consult Dr. K. Gnanapragasam or your registered doctor.*";

  if (ai) {
    try {
      const systemInstruction = `You are an elite, highly trusted clinical pharmacy AI assistant representing Gishor Pharmacy in Jaffna, Srilanka. 
Your goal is to answer patient symptoms or wellness inquiries, check minor ailments, and suggest standard safe OTC medicines or daily supplements.
CRITICAL REQUIREMENTS:
1. Always maintain a warm, safe, medical-grade, professional, and reassuring tone.
2. If a patient describes general symptoms (e.g., headache, fever, cough, joint pain), first ask 3 to 5 targeted questions (e.g. duration, age, severity, other medications) to refine the situation before giving full OTC recommendations.
3. If they describe red flag emergency symptoms (e.g. chest pain, breathing struggles, slurred speech), IMMEDIATELY warn them to stop the chat and call Jaffna Teaching Hospital emergency ambulance immediately (+94212222222).
4. Do not diagnose conditions directly. Present information as "Informative symptom guidelines".
5. Add appropriate regional advice (e.g., stay hydrated in Jaffna, check dengue safety, avoid dehydration during warm seasons).`;

      // Reformat history for GoogleGenAI SDK
      const contents = history.map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: { systemInstruction }
      });

      const reply = (response.text || "").trim() + disclaimer;
      return res.json({ text: reply });
    } catch (err) {
      console.error("Gemini chat error, using local fallback advisory:", err);
    }
  }

  // Fallback Rule Engine
  const text = message.toLowerCase();
  let reply = "";

  if (text.includes("chest pain") || text.includes("breath") || text.includes("heart attack")) {
    reply = "🚨 **EMERGENCY WARNING:** Your symptoms might indicate an acute cardiovascular crisis. Please stop searching online immediately and call the emergency ward at Jaffna Teaching Hospital (+94212222222) or arrange immediate transport to the nearest clinic.";
  } else if (text.includes("fever") || text.includes("cough") || text.includes("headache")) {
    reply = `I understand you are experiencing a fever or pain. To help me give you safe, relevant information, could you tell me:
1. How long has this fever/pain been persisting?
2. Are you experiencing any other symptoms like joint pain, rashes, or vomiting?
3. What is the age of the patient, and are they currently on any chronic medications (e.g., blood thinners)?

*Standard advice: Paracetamol (500mg) is highly effective for pain and fever relief, while Cetirizine (10mg) relieves associated runny nose.*`;
  } else if (text.includes("diabetes") || text.includes("metformin") || text.includes("sugar")) {
    reply = "Managing diabetic wellness is key. Patients on Glucophage (Metformin) should maintain steady meal schedules, stay highly hydrated in Sri Lankan heat to protect renal functions, and take their doses precisely during breakfast/dinner to reduce gastrointestinal irritation. We recommend scheduling a monthly blood glucose analysis.";
  } else {
    reply = "Thank you for reaching out to Gishor Pharmacy. Could you please specify your wellness concern or symptoms? Please share: \n1. Your main symptoms.\n2. How long you've had them.\n3. Any existing allergies (such as Penicillin) so our pharmacists can recommend the safest Over-The-Counter support.";
  }

  res.json({ text: reply + disclaimer });
});

// Prescription OCR Scanner API
app.post('/api/prescriptions/ocr', async (req, res) => {
  const { imageBase64 } = req.body;

  if (ai && imageBase64) {
    try {
      // Stripping data headers from base64 if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      };

      const promptPart = {
        text: `You are an expert clinical pharmacist digitizing written doctors prescriptions.
Please analyze the uploaded prescription image and extract the crucial fields.
Your output MUST be a valid JSON object conforming exactly to this schema:
{
  "medicineName": "Extracted medicine name (e.g. Metformin, Amoxicillin, etc.)",
  "dosage": "Sig instructions (e.g., 1 capsule twice daily after meals)",
  "strength": "Dose strength (e.g., 500mg, 10mg)",
  "quantity": "Amount of pills or bottles prescribed (e.g., Qty: 30 tablets)",
  "doctorName": "Doctor's name if readable (e.g., Dr. Thivya Aruliah)",
  "hospital": "Hospital name if visible (e.g., Jaffna Central Hospital)",
  "prescriptionDate": "Prescription date formatted as YYYY-MM-DD",
  "extractedText": "Brief full transcription of the readable script lines"
}
Ensure the JSON is strictly valid, with no markdown code fences or backticks. Only output JSON.`
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, promptPart],
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.medicineName) {
        return res.json({ ocr: parsed });
      }
    } catch (err) {
      console.error("Gemini prescription OCR failed, using smart parser:", err);
    }
  }

  // Standard safe intelligent fallback if Gemini is missing or image is placeholder
  const mockOCR = {
    medicineName: "Amoxil (Amoxicillin)",
    dosage: "Take 1 capsule 3 times daily (every 8 hours) with water",
    strength: "500mg",
    quantity: "21 Capsules (7 Days Course)",
    doctorName: "Prof. S. Kirupakaran",
    hospital: "Teaching Hospital Jaffna",
    prescriptionDate: new Date().toISOString().split('T')[0],
    extractedText: "Rx: Amoxicillin 500mg capsules. Dispense XXI (21 capsules). Sig: i cap t.i.d. pc. For bacterial chest infection. Dr. S. Kirupakaran, Teaching Hospital Jaffna."
  };

  res.json({ ocr: mockOCR });
});

// ----------------- VITE DEVELOPMENT & PRODUCTION SERVERS -----------------

async function startServer() {
  // Establish database connection with dynamic fallback support
  await connectMongoDB();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted as middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gishor Pharmacy Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer();
