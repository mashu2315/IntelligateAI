import mongoose from 'mongoose';

// Application-Specific Profile Data
// Notice how it references 'userId' from IntelliGate, rather than containing email/password
const AppProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // The IntelliGate X-User-ID
  address: { type: String, default: '' },
  preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  loyaltyPoints: { type: Number, default: 0 }
}, { timestamps: true });

// Application Business Logic Data
const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Foreign Key to IntelliGate
  products: [{ 
    name: String, 
    price: Number 
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

export const AppProfile = mongoose.model('AppProfile', AppProfileSchema);
export const Order = mongoose.model('Order', OrderSchema);
