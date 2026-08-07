import mongoose from "mongoose";

/**
 * ─────────────────────────────────────────────────────────────
 *  Likes  –  one document per (user, food) pair
 * ─────────────────────────────────────────────────────────────
 *
 *  A like is an EDGE, not a field on the food. The document
 *  either exists (liked) or it does not (not liked) — there is
 *  no `isLiked` boolean to keep in sync.
 *
 *  ── Why the target is three fields ───────────────────────────
 *
 *  Foods are embedded subdocuments inside Menu
 *  (menu.breakfast.foods[]), so there is NO "Food" collection
 *  and `ref: "Food"` can never be populated. To point at a food
 *  we store the full path to it:
 *
 *      menu      → which Menu document
 *      mealType  → which meal inside it
 *      food      → the subdocument _id
 *
 *  `food` alone is already unique (Mongoose generates a real
 *  ObjectId for every subdocument), so it is the toggle key.
 *  `menu` and `mealType` are denormalised so that "all likes on
 *  this menu" is a single indexed query instead of a scan.
 *
 * ─────────────────────────────────────────────────────────────
 */

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    // ── Target: menu → mealType → food ────────────────────────
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },

    mealType: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner"],
    },

    // Embedded subdocument _id — intentionally has no `ref`,
    // because populate() cannot resolve a subdocument.
    food: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// ── Toggle key ───────────────────────────────────────────────
// Makes a like idempotent: a double-tap or a retried request
// hits a duplicate-key error (E11000) instead of creating a
// second like. Pair it with an upsert in the controller.
likeSchema.index({ user: 1, food: 1 }, { unique: true });

// ── Read paths ───────────────────────────────────────────────
// "who liked this food, most recent first"
likeSchema.index({ food: 1, createdAt: -1 });

// "which foods on this menu has anyone liked" — used to build
// the whole day's like state in one query instead of N.
likeSchema.index({ menu: 1, mealType: 1 });

// "what has this user liked" — the inverse edge.
likeSchema.index({ user: 1, createdAt: -1 });

const likeModel = mongoose.model("Likes", likeSchema);

export default likeModel;
