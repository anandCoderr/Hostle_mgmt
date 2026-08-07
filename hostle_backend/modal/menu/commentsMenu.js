import mongoose from "mongoose";

/**
 * ─────────────────────────────────────────────────────────────
 *  Comments  –  one document per comment or reply
 * ─────────────────────────────────────────────────────────────
 *
 *  Targeting works exactly like Likes: menu → mealType → food.
 *  See likeMenu.js for why the target is three fields.
 *
 *  ── Threading: one level only ────────────────────────────────
 *
 *  `parent` is null for a root comment and holds a root
 *  comment's _id for a reply. Replies to replies are rejected
 *  in the controller, which keeps every read a flat, indexed
 *  query — no recursion, no materialised paths.
 *
 *  This is the same constraint Instagram and YouTube apply.
 *  Arbitrary depth (Reddit / HN) only pays off once threads get
 *  long enough to argue in.
 *
 *  ── Soft delete ──────────────────────────────────────────────
 *
 *  Deleting a comment sets `isDeleted` instead of removing the
 *  row, so replies hanging off it keep a valid parent. The
 *  controller returns a "[deleted]" placeholder and keeps the
 *  original text for moderation.
 *
 * ─────────────────────────────────────────────────────────────
 */

const commentSchema = new mongoose.Schema(
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

    // Embedded subdocument _id — no `ref`, cannot be populated.
    food: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Comment is too long"],
    },

    // ── Threading ─────────────────────────────────────────────
    // null = root comment. Otherwise the _id of a ROOT comment.
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
      default: null,
    },

    // ── Denormalised counters ─────────────────────────────────
    // Kept here so rendering a thread never has to count rows.
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Lifecycle flags ───────────────────────────────────────
    isEdited: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ── Read paths ───────────────────────────────────────────────
// Root comments on a food, newest first. `parent` sits in the
// index so { parent: null } is served without a filter pass.
commentSchema.index({ food: 1, parent: 1, createdAt: -1 });

// Replies under one root comment, oldest first (reading order).
commentSchema.index({ parent: 1, createdAt: 1 });

// Every comment on a menu — used to hydrate a whole day at once.
commentSchema.index({ menu: 1, mealType: 1, createdAt: -1 });

// "what has this user commented on" — the inverse edge.
commentSchema.index({ user: 1, createdAt: -1 });

const commentModel = mongoose.model("Comments", commentSchema);

export default commentModel;
