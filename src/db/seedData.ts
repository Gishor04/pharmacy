export const INITIAL_MEDICINES = [
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
  },
  {
    id: "med-10",
    name: "Himalaya Moisturizing Body Lotion",
    genericName: "Aloe Vera & Milk Protein Body Lotion",
    category: "Body Care",
    price: 680,
    description: "Dermatologist-tested daily moisturizing body lotion with pure Aloe Vera and natural milk proteins. Deeply nourishes dry and sensitive skin in Jaffna's warm climate.",
    usageInstructions: "Apply generously all over the body after bath and at bedtime. Massage gently until fully absorbed.",
    sideEffects: [],
    warnings: "For external use only. Avoid contact with eyes. Discontinue use if skin irritation occurs.",
    strength: "200ml",
    stock: 95,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: false,
    reviewsCount: 34,
    rating: 4.6,
    expiryDate: "2028-04-30"
  },
  {
    id: "med-11",
    name: "Dettol Antiseptic Liquid",
    genericName: "Chloroxylenol 4.8% w/v",
    category: "Body Care",
    price: 490,
    description: "Original clinical antiseptic liquid trusted by hospitals and homes for over 90 years. Kills 99.9% of germs on skin wounds, cuts, and insect bites. Essential for every Sri Lankan household.",
    usageInstructions: "For wound care: Dilute 1 capful in a mug of water. For bathing: Add 2 capfuls to bath water. Do not apply undiluted to broken skin.",
    sideEffects: ["Mild skin dryness with frequent use"],
    warnings: "Keep out of reach of children. Not for internal use. If swallowed seek medical advice immediately.",
    strength: "100ml",
    stock: 200,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: false,
    reviewsCount: 67,
    rating: 4.9,
    expiryDate: "2028-11-30"
  },
  {
    id: "med-12",
    name: "Cuticura Medicated Talcum Powder",
    genericName: "Zinc Oxide & Menthol Talc",
    category: "Body Care",
    price: 320,
    description: "Classic medicated talcum powder with cooling menthol and zinc oxide. Prevents heat rash, prickly heat, and bacterial growth in Sri Lanka's tropical heat. Gentle for all skin types.",
    usageInstructions: "Apply generously to clean, dry skin, particularly underarms, groin, and skin folds. Use after bathing daily.",
    sideEffects: [],
    warnings: "Avoid inhalation. Keep away from baby's face. For external use only.",
    strength: "200g",
    stock: 150,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&auto=format&fit=crop&q=60",
    requiresPrescription: false,
    reviewsCount: 19,
    rating: 4.5,
    expiryDate: "2029-01-31"
  }
];

export const INITIAL_CATEGORIES = [
  { id: "cat-1", name: "Prescription Medicines", icon: "Pills", description: "Rx drugs requiring professional review and approval", itemCount: 3 },
  { id: "cat-2", name: "OTC Medicines", icon: "Activity", description: "Over-the-counter daily relievers, syrups, and tablets", itemCount: 2 },
  { id: "cat-3", name: "Wellness", icon: "HeartPulse", description: "Daily hygiene, skin treatments, and healthcare goods", itemCount: 1 },
  { id: "cat-4", name: "Baby Care", icon: "Baby", description: "Formulas, diapers, soft wipes, and vitamins for children", itemCount: 1 },
  { id: "cat-5", name: "Elderly Care", icon: "ShieldAlert", description: "High-protein supplements, mobility supports, and aids", itemCount: 1 },
  { id: "cat-6", name: "Supplements", icon: "Sparkles", description: "Vitamins, immunity capsules, and muscle protein powders", itemCount: 1 },
  { id: "cat-7", name: "Body Care", icon: "Droplets", description: "Antiseptics, moisturizers, talcum powders, and skincare", itemCount: 3 }
];

export const INITIAL_PHARMACISTS = [
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

export const INITIAL_DOCTORS = [
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

export const INITIAL_BLOGS = [
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

export const INITIAL_DRUG_INTERACTIONS = [
  { medicineA: "Amoxil (Amoxicillin)", medicineB: "Lipitor (Atorvastatin)", severity: "Safe", description: "No clinical interaction observed. Safe to take concurrently with appropriate timing." },
  { medicineA: "Glucophage (Metformin)", medicineB: "Lipitor (Atorvastatin)", severity: "Safe", description: "Safe and frequently prescribed together for type 2 diabetes with lipid control. Ensure kidney function tests are stable." },
  { medicineA: "Paracetamol (Panadol)", medicineB: "Glucophage (Metformin)", severity: "Safe", description: "No mutual side effects. Avoid alcohol ingestion during active pain/fever therapy." },
  { medicineA: "Amoxil (Amoxicillin)", medicineB: "Oral Contraceptives", severity: "Warning", description: "Amoxicillin may reduce systemic absorption and efficacy of oral contraceptive pills. Use secondary barrier methods during antibiotic therapy." },
  { medicineA: "Warfarin", medicineB: "Aspirin", severity: "Consult Pharmacist", description: "Red level alert! High risk of profound systemic bleeding. Combined use impairs platelet aggregation and coagulation simultaneously." },
  { medicineA: "Lipitor (Atorvastatin)", medicineB: "Clarithromycin", severity: "Consult Pharmacist", description: "Clarithromycin dramatically increases statin concentrations, heightening risk of acute muscle breakdown (rhabdomyolysis). Hold statin during antibiotic course." }
];

export const INITIAL_SETTINGS = {
  pharmacyName: "Kaithady MediCare Hub",
  address: "Jaffna, Sri Lanka",
  licenseNumber: "PHA-12345",
  pharmacistInCharge: "Dr. K. Gnanapragasam",
  whatsappNumber: "+94771234567",
  emergencyContact: "+94212222222",
  openingHours: "8:00 AM - 10:00 PM",
  vatPercentage: 15,
  enableSmsAlerts: true
};
