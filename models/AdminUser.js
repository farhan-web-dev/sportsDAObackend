import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  role: { type: String, default: "admin" },
});

export default mongoose.model("AdminUser", AdminUserSchema);
