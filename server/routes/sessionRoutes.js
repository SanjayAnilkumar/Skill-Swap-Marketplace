const express = require("express");
const mongoose = require("mongoose");
const Session = require("../models/Session");
const Request = require("../models/Request");
const router = express.Router();

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

// List sessions for a student
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!validId(userId)) return res.status(400).json({ message: "Invalid user ID" });
    const sessions = await Session.find({ $or: [{ requester: userId }, { partner: userId }] })
      .populate("requester", "name email").populate("partner", "name email")
      .populate("completedBy", "name").populate("feedback.from", "name")
      .sort({ scheduledAt: 1 });
    res.json(sessions);
  } catch (error) { res.status(500).json({ message: "Failed to fetch sessions", error: error.message }); }
});

// Schedule a session only with an accepted connection
router.post("/", async (req, res) => {
  try {
    const { requester, partner, skill, scheduledAt, mode, notes } = req.body;
    if (![requester, partner].every(validId) || requester === partner) return res.status(400).json({ message: "Choose a valid connection." });
    if (!skill || !String(skill).trim() || !scheduledAt) return res.status(400).json({ message: "Skill, date and time are required." });
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime()) || date <= new Date()) return res.status(400).json({ message: "Choose a future date and time." });
    const accepted = await Request.findOne({ status: "Accepted", $or: [{ sender: requester, receiver: partner }, { sender: partner, receiver: requester }] });
    if (!accepted) return res.status(403).json({ message: "You can schedule sessions only with an accepted connection." });
    const session = await Session.create({ requester, partner, skill: String(skill).trim(), scheduledAt: date, mode: mode === "In person" ? "In person" : "Online", notes: String(notes || "").trim() });
    const result = await Session.findById(session._id).populate("requester", "name email").populate("partner", "name email");
    res.status(201).json({ message: "Session scheduled successfully!", session: result });
  } catch (error) { res.status(500).json({ message: "Failed to schedule session", error: error.message }); }
});

// Mark session complete (either participant can do so)
router.put("/:sessionId/complete", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!validId(userId)) return res.status(400).json({ message: "Invalid user ID" });
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (![String(session.requester), String(session.partner)].includes(String(userId))) return res.status(403).json({ message: "You are not part of this session." });
    if (session.status === "Cancelled") return res.status(400).json({ message: "Cancelled sessions cannot be completed." });
    if (!session.completedBy.some((id) => String(id) === String(userId))) session.completedBy.push(userId);
    session.status = "Completed";
    await session.save();
    res.json({ message: "Session marked as completed.", session });
  } catch (error) { res.status(500).json({ message: "Failed to complete session", error: error.message }); }
});

// Leave one feedback entry per participant per session
router.post("/:sessionId/feedback", async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    if (!validId(userId)) return res.status(400).json({ message: "Invalid user ID" });
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return res.status(400).json({ message: "Rating must be from 1 to 5." });
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (![String(session.requester), String(session.partner)].includes(String(userId))) return res.status(403).json({ message: "You are not part of this session." });
    if (session.status !== "Completed") return res.status(400).json({ message: "Complete the session before leaving feedback." });
    const existing = session.feedback.find((entry) => String(entry.from) === String(userId));
    if (existing) return res.status(400).json({ message: "You have already submitted feedback for this session." });
    session.feedback.push({ from: userId, rating: numericRating, comment: String(comment || "").trim() });
    await session.save();
    res.status(201).json({ message: "Feedback submitted. Thank you!" });
  } catch (error) { res.status(500).json({ message: "Failed to submit feedback", error: error.message }); }
});

module.exports = router;
