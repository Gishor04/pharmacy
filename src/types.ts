export enum UserRole {
  CUSTOMER = 'Customer',
  PHARMACIST = 'Pharmacist',
  ADMIN = 'Admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  allergies?: string[];
  chronicConditions?: string[];
  avatar?: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  description: string;
  usageInstructions: string;
  sideEffects: string[];
  warnings: string;
  strength: string; // e.g., "500mg"
  stock: number;
  image: string;
  images?: string[]; // Multiple angle views
  manufacturer?: string;
  manufacturerLogo?: string;
  requiresPrescription: boolean;
  reviewsCount: number;
  rating: number;
  expiryDate: string;
}

export interface MedicineCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  itemCount: number;
}

export enum OrderStatus {
  PENDING = 'Pending',
  PREPARATION = 'In Preparation',
  WAITING_PHARMACIST = 'Awaiting Pharmacist Approval',
  APPROVED = 'Approved',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface OrderItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
  strength: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: 'Cash on Delivery' | 'Card' | 'Mobile Wallet';
  paymentStatus: 'Pending' | 'Paid';
  deliveryAddress: string;
  prescriptionUrl?: string;
  ocrDetails?: PrescriptionOCR;
  refillReminderEnabled?: boolean;
  notes?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  customerId: string;
  customerName: string;
  imageUrl: string;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Draft Order Created';
  ocrDetails?: PrescriptionOCR;
  assignedPharmacistId?: string;
  notes?: string;
  createdAt: string;
}

export interface PrescriptionOCR {
  medicineName: string;
  dosage: string;
  strength: string;
  quantity: string;
  doctorName: string;
  hospital: string;
  prescriptionDate: string;
  extractedText?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  avatar: string;
  rating: number;
  availability: string[]; // e.g., ["Monday 09:00 - 12:00"]
}

export interface Pharmacist {
  id: string;
  name: string;
  licenseNumber: string;
  certifications: string[];
  yearsOfService: number;
  avatar: string;
  rating: number;
  status: 'Online' | 'Offline';
  specialization?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  pharmacistId: string;
  pharmacistName: string;
  date: string;
  timeSlot: string;
  type: 'Chat' | 'Voice' | 'Video';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  meetingLink?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  expiryDate: string;
  description: string;
}

export interface Review {
  id: string;
  medicineId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  category: 'Medicine Guide' | 'Health Awareness' | 'Nutrition Tips' | 'First Aid' | 'Preventive Healthcare';
  content: string;
  image: string;
  readTime: string;
  author: string;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Order' | 'Refill' | 'Appointment' | 'Promo' | 'Alert';
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AIChat {
  id: string;
  customerId: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface DrugInteractionResult {
  medicineA: string;
  medicineB: string;
  severity: 'Safe' | 'Warning' | 'Consult Pharmacist';
  description: string;
}

export interface AllergyProfile {
  customerId: string;
  allergies: string[];
  contraindications: string[];
}

export interface RefillSchedule {
  id: string;
  customerId: string;
  customerPhone: string;
  medicineName: string;
  lastRefillDate: string;
  predictedRefillDate: string;
  frequencyDays: number;
  status: 'Active' | 'Refilled' | 'Paused';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}
