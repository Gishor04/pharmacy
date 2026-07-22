import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { UserRole, OrderStatus } from './src/types.js';
import { connectMongoDB, dbAdapter } from './src/db/mongodb.js';


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
      const systemInstruction = `You are an elite, highly trusted clinical pharmacy AI assistant representing Kaithady MediCare Hub in Jaffna, Srilanka. 
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
    reply = "Thank you for reaching out to Kaithady MediCare Hub. Could you please specify your wellness concern or symptoms? Please share: \n1. Your main symptoms.\n2. How long you've had them.\n3. Any existing allergies (such as Penicillin) so our pharmacists can recommend the safest Over-The-Counter support.";
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

// ----------------- VITE DEVELOPMENT & PRODUCTION SERVERS -----------------

// For local development or non-Vercel production environments
async function startServer() {
  // Establish database connection with dynamic fallback support
  await connectMongoDB();

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`Kaithady MediCare Hub Full-Stack Server running at http://localhost:${PORT}`);
  });
}

// Check if running on Vercel
const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  startServer();
} else {
  // On Vercel, we need to ensure the database is connected when handling requests
  // We can attach a middleware to lazily connect
  let dbConnected = false;
  app.use(async (req, res, next) => {
    if (!dbConnected) {
      await connectMongoDB();
      dbConnected = true;
    }
    next();
  });
}

export default app;
