import mongoose from "mongoose";

const inviteModal = new mongoose.schema(
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
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
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

const Inviteuser = mongoose.model("Inviteuser", inviteModal);

export default Inviteuser;
