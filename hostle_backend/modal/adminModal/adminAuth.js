import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminAuthSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timeStamp: true },
);

adminAuthSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

const AdminAuth = mongoose.model("Admin", adminAuthSchema);
export default AdminAuth;
