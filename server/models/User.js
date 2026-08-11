import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  id: String,
  name: String,
  meta: Object
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  connectedServices: { type: [serviceSchema], default: [] },
  preferences: { type: Map, of: Object, default: {} }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
