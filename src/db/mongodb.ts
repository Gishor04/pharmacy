import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { UserRole, OrderStatus } from '../types';

// Connection status
let isMongoConnected = false;

// Local JSON File Database path for fallback
const DB_FILE = path.join(process.cwd(), 'db.json');

// Mongoose Option Configs
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s for fast fallback
};

// ----------------- SCHEMAS & MODELS -----------------

// 1. User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: 'Jaffna' },
  allergies: { type: [String], default: [] },
  chronicConditions: { type: [String], default: [] },
  avatar: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

// 2. Medicine Schema
const MedicineSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  usageInstructions: { type: String, required: true },
  sideEffects: { type: [String], default: [] },
  warnings: { type: String, default: 'Consult with a pharmacist.' },
  strength: { type: String, required: true },
  stock: { type: Number, required: true },
  image: { type: String, required: true },
  requiresPrescription: { type: Boolean, default: false },
  reviewsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  expiryDate: { type: String, required: true }
});

// 3. Category Schema
const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  itemCount: { type: Number, default: 0 }
});

// 4. Pharmacist Schema
const PharmacistSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  certifications: { type: [String], default: [] },
  yearsOfService: { type: Number, required: true },
  avatar: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  status: { type: String, enum: ['Online', 'Offline'], default: 'Online' },
  specialization: { type: String, default: '' }
});

// 5. Doctor Schema
const DoctorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  hospital: { type: String, required: true },
  avatar: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  availability: { type: [String], default: [] }
});

// 6. Blog Schema
const BlogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  readTime: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true }
});

// 7. Drug Interaction Schema
const DrugInteractionSchema = new mongoose.Schema({
  medicineA: { type: String, required: true },
  medicineB: { type: String, required: true },
  severity: { type: String, required: true },
  description: { type: String, required: true }
});

// 8. Order Schema
const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  items: [{
    medicineId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    strength: { type: String, required: true }
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: Object.values(OrderStatus), required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  prescriptionUrl: { type: String, default: null },
  ocrDetails: {
    medicineName: String,
    dosage: String,
    strength: String,
    quantity: String,
    doctorName: String,
    hospital: String,
    prescriptionDate: String,
    extractedText: String
  },
  refillReminderEnabled: { type: Boolean, default: true },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

// 9. Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  pharmacistId: { type: String, required: true },
  pharmacistName: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: 'Scheduled' },
  notes: { type: String, default: '' },
  meetingLink: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

// 10. Refill Schedule Schema
const RefillScheduleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerPhone: { type: String, required: true },
  medicineName: { type: String, required: true },
  lastRefillDate: { type: String, required: true },
  predictedRefillDate: { type: String, required: true },
  frequencyDays: { type: Number, required: true },
  status: { type: String, default: 'Active' }
});

// 11. Activity Log Schema
const ActivityLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() }
});

// 12. Settings Schema
const SettingsSchema = new mongoose.Schema({
  pharmacyName: { type: String, required: true },
  address: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  pharmacistInCharge: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  openingHours: { type: String, required: true },
  vatPercentage: { type: Number, default: 0 },
  enableSmsAlerts: { type: Boolean, default: true }
});

// Define Models (compiling them safely)
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const MedicineModel = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const PharmacistModel = mongoose.models.Pharmacist || mongoose.model('Pharmacist', PharmacistSchema);
export const DoctorModel = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
export const BlogModel = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
export const DrugInteractionModel = mongoose.models.DrugInteraction || mongoose.model('DrugInteraction', DrugInteractionSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const AppointmentModel = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
export const RefillScheduleModel = mongoose.models.RefillSchedule || mongoose.model('RefillSchedule', RefillScheduleSchema);
export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
export const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

// ----------------- CONNECTION & SEED ENGINE -----------------

export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI found. Pharmacy platform will run in highly optimized Local JSON Database Mode.");
    isMongoConnected = false;
    return false;
  }

  try {
    console.log("Attempting to establish secure connection to MongoDB...");
    await mongoose.connect(uri, MONGO_OPTIONS);
    isMongoConnected = true;
    console.log("🟢 SUCCESS: Connected to MongoDB Atlas. Syncing clinical records...");
    
    // Seed database if empty
    await seedDatabaseIfNeeded();
    return true;
  } catch (err) {
    console.error("🔴 MongoDB connection failed. Falling back to Local JSON Database. Error:", err);
    isMongoConnected = false;
    return false;
  }
}

// Check if mongo is connected
export function getMongoStatus() {
  return isMongoConnected;
}

// Fallback Database Helpers
function getLocalDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Unable to read local db.json fallback database:", err);
    return null;
  }
}

function saveLocalDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Unable to write local db.json fallback database:", err);
  }
}

// Seed MongoDB with initial records if they do not exist
async function seedDatabaseIfNeeded() {
  const localDb = getLocalDB();
  if (!localDb) return;

  try {
    // 1. Seed Users
    const userCount = await UserModel.countDocuments();
    if (userCount === 0 && localDb.users) {
      console.log("Seeding users into MongoDB...");
      await UserModel.insertMany(localDb.users);
    }

    // 2. Seed Medicines
    const medCount = await MedicineModel.countDocuments();
    if (medCount === 0 && localDb.medicines) {
      console.log("Seeding medicines into MongoDB...");
      await MedicineModel.insertMany(localDb.medicines);
    }

    // 3. Seed Categories
    const catCount = await CategoryModel.countDocuments();
    if (catCount === 0 && localDb.categories) {
      console.log("Seeding categories into MongoDB...");
      await CategoryModel.insertMany(localDb.categories);
    }

    // 4. Seed Pharmacists
    const phCount = await PharmacistModel.countDocuments();
    if (phCount === 0 && localDb.pharmacists) {
      console.log("Seeding pharmacists into MongoDB...");
      await PharmacistModel.insertMany(localDb.pharmacists);
    }

    // 5. Seed Doctors
    const docCount = await DoctorModel.countDocuments();
    if (docCount === 0 && localDb.doctors) {
      console.log("Seeding doctors into MongoDB...");
      await DoctorModel.insertMany(localDb.doctors);
    }

    // 6. Seed Blogs
    const blogCount = await BlogModel.countDocuments();
    if (blogCount === 0 && localDb.blogs) {
      console.log("Seeding blogs into MongoDB...");
      await BlogModel.insertMany(localDb.blogs);
    }

    // 7. Seed Drug Interactions
    const intCount = await DrugInteractionModel.countDocuments();
    if (intCount === 0 && localDb.interactions) {
      console.log("Seeding drug interactions into MongoDB...");
      await DrugInteractionModel.insertMany(localDb.interactions);
    }

    // 8. Seed Orders
    const orderCount = await OrderModel.countDocuments();
    if (orderCount === 0 && localDb.orders) {
      console.log("Seeding orders into MongoDB...");
      await OrderModel.insertMany(localDb.orders);
    }

    // 9. Seed Appointments
    const apptCount = await AppointmentModel.countDocuments();
    if (apptCount === 0 && localDb.appointments) {
      console.log("Seeding appointments into MongoDB...");
      await AppointmentModel.insertMany(localDb.appointments);
    }

    // 10. Seed Refills
    const refillCount = await RefillScheduleModel.countDocuments();
    if (refillCount === 0 && localDb.refillSchedules) {
      console.log("Seeding refill schedules into MongoDB...");
      await RefillScheduleModel.insertMany(localDb.refillSchedules);
    }

    // 11. Seed Logs
    const logCount = await ActivityLogModel.countDocuments();
    if (logCount === 0 && localDb.activityLogs) {
      console.log("Seeding activity logs into MongoDB...");
      await ActivityLogModel.insertMany(localDb.activityLogs);
    }

    // 12. Seed Settings
    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0 && localDb.settings) {
      console.log("Seeding setting parameters into MongoDB...");
      await SettingsModel.create(localDb.settings);
    }

    console.log("Database synchronization completed. All clinical registers up-to-date in MongoDB.");
  } catch (err) {
    console.error("Failed to seed MongoDB collections:", err);
  }
}

// ----------------- UNIFIED DATA ADAPTERS (DURAL MODE) -----------------

export const dbAdapter = {
  // --- USERS ---
  async getUsers() {
    if (isMongoConnected) {
      const users = await (UserModel as any).find();
      return users.map((u: any) => u.toObject());
    } else {
      return getLocalDB()?.users || [];
    }
  },

  async findUserByEmailAndRole(email: string, role: string) {
    if (isMongoConnected) {
      const user = await (UserModel as any).findOne({ email: new RegExp(`^${email}$`, 'i'), role });
      return user ? user.toObject() : null;
    } else {
      const db = getLocalDB();
      return db?.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.role === role) || null;
    }
  },

  async createUser(userData: any) {
    if (isMongoConnected) {
      const user = new UserModel(userData);
      await user.save();
      return user.toObject();
    } else {
      const db = getLocalDB();
      db.users.push(userData);
      saveLocalDB(db);
      return userData;
    }
  },

  // --- MEDICINES ---
  async getMedicines() {
    if (isMongoConnected) {
      const medicines = await (MedicineModel as any).find();
      return medicines.map((m: any) => m.toObject());
    } else {
      return getLocalDB()?.medicines || [];
    }
  },

  async createMedicine(medData: any) {
    if (isMongoConnected) {
      const med = new MedicineModel(medData);
      await med.save();
      return med.toObject();
    } else {
      const db = getLocalDB();
      db.medicines.push(medData);
      saveLocalDB(db);
      return medData;
    }
  },

  async deleteMedicine(id: string) {
    if (isMongoConnected) {
      const med = await (MedicineModel as any).findOneAndDelete({ id });
      return med ? med.toObject() : null;
    } else {
      const db = getLocalDB();
      const idx = db.medicines.findIndex((m: any) => m.id === id);
      if (idx !== -1) {
        const removed = db.medicines.splice(idx, 1);
        saveLocalDB(db);
        return removed[0];
      }
      return null;
    }
  },

  async updateMedicineStock(medicineId: string, quantityToDeduct: number) {
    if (isMongoConnected) {
      const med = await (MedicineModel as any).findOne({ id: medicineId });
      if (med) {
        med.stock = Math.max(0, med.stock - quantityToDeduct);
        await med.save();
      }
    } else {
      const db = getLocalDB();
      const mIdx = db.medicines.findIndex((m: any) => m.id === medicineId);
      if (mIdx !== -1) {
        db.medicines[mIdx].stock = Math.max(0, db.medicines[mIdx].stock - quantityToDeduct);
        saveLocalDB(db);
      }
    }
  },

  // --- CATEGORIES ---
  async getCategories() {
    if (isMongoConnected) {
      const cats = await (CategoryModel as any).find();
      return cats.map((c: any) => c.toObject());
    } else {
      return getLocalDB()?.categories || [];
    }
  },

  // --- PHARMACISTS ---
  async getPharmacists() {
    if (isMongoConnected) {
      const phs = await (PharmacistModel as any).find();
      return phs.map((p: any) => p.toObject());
    } else {
      return getLocalDB()?.pharmacists || [];
    }
  },

  // --- DOCTORS ---
  async getDoctors() {
    if (isMongoConnected) {
      const docs = await (DoctorModel as any).find();
      return docs.map((d: any) => d.toObject());
    } else {
      return getLocalDB()?.doctors || [];
    }
  },

  // --- BLOGS ---
  async getBlogs() {
    if (isMongoConnected) {
      const blogs = await (BlogModel as any).find();
      return blogs.map((b: any) => b.toObject());
    } else {
      return getLocalDB()?.blogs || [];
    }
  },

  // --- DRUG INTERACTIONS ---
  async getInteractions() {
    if (isMongoConnected) {
      const ints = await (DrugInteractionModel as any).find();
      return ints.map((i: any) => i.toObject());
    } else {
      return getLocalDB()?.interactions || [];
    }
  },

  // --- ORDERS ---
  async getOrders() {
    if (isMongoConnected) {
      const orders = await (OrderModel as any).find();
      return orders.map((o: any) => o.toObject());
    } else {
      return getLocalDB()?.orders || [];
    }
  },

  async createOrder(orderData: any) {
    if (isMongoConnected) {
      const order = new OrderModel(orderData);
      await order.save();
      return order.toObject();
    } else {
      const db = getLocalDB();
      db.orders.push(orderData);
      saveLocalDB(db);
      return orderData;
    }
  },

  async updateOrderStatus(id: string, status: string, paymentStatus?: string) {
    if (isMongoConnected) {
      const updateData: any = { status };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      const order = await (OrderModel as any).findOneAndUpdate({ id }, updateData, { new: true });
      return order ? order.toObject() : null;
    } else {
      const db = getLocalDB();
      const orderIdx = db.orders.findIndex((o: any) => o.id === id);
      if (orderIdx !== -1) {
        db.orders[orderIdx].status = status;
        if (paymentStatus) db.orders[orderIdx].paymentStatus = paymentStatus;
        saveLocalDB(db);
        return db.orders[orderIdx];
      }
      return null;
    }
  },

  // --- APPOINTMENTS ---
  async getAppointments() {
    if (isMongoConnected) {
      const appts = await (AppointmentModel as any).find();
      return appts.map((a: any) => a.toObject());
    } else {
      return getLocalDB()?.appointments || [];
    }
  },

  async createAppointment(apptData: any) {
    if (isMongoConnected) {
      const appt = new AppointmentModel(apptData);
      await appt.save();
      return appt.toObject();
    } else {
      const db = getLocalDB();
      db.appointments.push(apptData);
      saveLocalDB(db);
      return apptData;
    }
  },

  // --- REFILL SCHEDULES ---
  async getRefillSchedules() {
    if (isMongoConnected) {
      const refills = await (RefillScheduleModel as any).find();
      return refills.map((r: any) => r.toObject());
    } else {
      return getLocalDB()?.refillSchedules || [];
    }
  },

  async createRefillSchedule(refillData: any) {
    if (isMongoConnected) {
      const ref = new RefillScheduleModel(refillData);
      await ref.save();
      return ref.toObject();
    } else {
      const db = getLocalDB();
      db.refillSchedules.push(refillData);
      saveLocalDB(db);
      return refillData;
    }
  },

  // --- ACTIVITY LOGS ---
  async getActivityLogs() {
    if (isMongoConnected) {
      const logs = await (ActivityLogModel as any).find().sort({ timestamp: -1 });
      return logs.map((l: any) => l.toObject());
    } else {
      return getLocalDB()?.activityLogs || [];
    }
  },

  async createActivityLog(logData: any) {
    if (isMongoConnected) {
      const log = new ActivityLogModel(logData);
      await log.save();
      return log.toObject();
    } else {
      const db = getLocalDB();
      db.activityLogs.push(logData);
      saveLocalDB(db);
      return logData;
    }
  },

  // --- SETTINGS ---
  async getSettings() {
    if (isMongoConnected) {
      const settings = await (SettingsModel as any).findOne();
      return settings ? settings.toObject() : getLocalDB()?.settings;
    } else {
      return getLocalDB()?.settings || {};
    }
  },

  async updateSettings(settingsData: any) {
    if (isMongoConnected) {
      let settings = await (SettingsModel as any).findOne();
      if (settings) {
        Object.assign(settings, settingsData);
        await settings.save();
      } else {
        settings = new SettingsModel(settingsData);
        await settings.save();
      }
      return settings.toObject();
    } else {
      const db = getLocalDB();
      db.settings = { ...db.settings, ...settingsData };
      saveLocalDB(db);
      return db.settings;
    }
  }
};
