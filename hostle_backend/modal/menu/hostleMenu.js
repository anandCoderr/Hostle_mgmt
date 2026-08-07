import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],

    // ── Denormalised counters ─────────────────────────────────
    // Maintained with $inc alongside every Likes / Comments
    // write. Rendering a menu must never count those collections.
    // Treated as approximate — see Likes/Comments for the source
    // of truth if a reconciliation job is ever needed.
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const mealSchema = new mongoose.Schema(
  {
    foods: [foodSchema],

    description: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const menuSchemaVar = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["WEEKLY", "SPECIAL"],
    },

    // Required only when type = WEEKLY
    day: {
      type: String,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
    },

    // Required only when type = SPECIAL
    date: {
      type: Date,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },

    breakfast: mealSchema,

    lunch: mealSchema,

    dinner: mealSchema,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const menuSchema = mongoose.model("Menu", menuSchemaVar);

export default menuSchema;
