import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userModal = await mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    room: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
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
  },
  {
    timestamps: true,
  },
);

userModal.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// userModal.index({ email: 1 });
// userModal.index({ phone: 1 });
userModal.index({ room: 1 });
userModal.index({ phone: 1, email: 1 });

userModal.index({ room: 1, email: 1 }, { unique: true });
userModal.index({ room: 1, phone: 1 }, { unique: true });

const userSchema = mongoose.model("Users", userModal);

export default userSchema;
