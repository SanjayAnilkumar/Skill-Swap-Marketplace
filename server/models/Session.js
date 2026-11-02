const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 1000, default: "" },
}, { timestamps: true });

const sessionSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: { type: String, required: true, trim: true, maxlength: 120 },
  scheduledAt: { type: Date, required: true },
  mode: { type: String, enum: ["Online", "In person"], default: "Online" },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  feedback: [feedbackSchema],
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
