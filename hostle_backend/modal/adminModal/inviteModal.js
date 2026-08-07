import mongoose from "mongoose";

const inviteModal = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      // required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

inviteModal.index({ email: 1 });
const Inviteuser = mongoose.model("Inviteuser", inviteModal);

export default Inviteuser;
