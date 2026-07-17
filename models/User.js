import mongoose from "mongoose";
import { ROLES, ROLE_VALUES, USER_STATUS } from "../config/constants.js";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: { type: String, default: null },
    image: { type: String, default: null },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.REPORTER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.INACTIVE,
    },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
