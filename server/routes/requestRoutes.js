const express = require("express");
const Request = require("../models/Request");

const router = express.Router();

// Send a swap request
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, skillId } = req.body;

    // Check if a request already exists
    const existingRequest = await Request.findOne({
      sender,
      receiver,
      skillId,
      status: "Pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You have already sent a request for this skill.",
      });
    }

    const newRequest = new Request({
      sender,
      receiver,
      skillId,
    });

    const savedRequest = await newRequest.save();

    res.status(201).json({
      message: "Swap request sent successfully",
      request: savedRequest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send request",
      error: error.message,
    });
  }
});

// Get requests for a student
router.get("/:userId", async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [
        { sender: req.params.userId },
        { receiver: req.params.userId },
      ],
    })
      .populate("sender", "name email department year")
      .populate("receiver", "name email department year")
      .populate("skillId");

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
});

// Accept a swap request
router.put("/:requestId/accept", async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status: "Accepted" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    res.status(200).json({
      message: "Request accepted successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to accept request",
      error: error.message,
    });
  }
});

// Reject a swap request
router.put("/:requestId/reject", async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status: "Rejected" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    res.status(200).json({
      message: "Request rejected successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject request",
      error: error.message,
    });
  }
});

module.exports = router;