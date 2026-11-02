const express = require("express");
const Message = require("../models/Message");
const Request = require("../models/Request");
const router = express.Router();

// Send a message
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    if (!sender || !receiver || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

     // Check whether an accepted swap exists
    const acceptedRequest = await Request.findOne({
      status: "Accepted",
      $or: [
        {
          sender: sender,
          receiver: receiver,
        },
        {
          sender: receiver,
          receiver: sender,
        },
      ],
    });

    if (!acceptedRequest) {
      return res.status(403).json({
        message:
          "Chat is available only after a swap request is accepted.",
      });
    }

    const newMessage = new Message({
      sender,
      receiver,
      message,
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({
      message: "Message sent successfully",
      chatMessage: savedMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// Get conversation between two students
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;


    // Check whether an accepted swap exists
    const acceptedRequest = await Request.findOne({
      status: "Accepted",
      $or: [
        {
          sender: user1,
          receiver: user2,
        },
        {
          sender: user2,
          receiver: user1,
        },
      ],
    });

    if (!acceptedRequest) {
      return res.status(403).json({
        message:
          "Chat is available only after a swap request is accepted.",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: user1,
          receiver: user2,
        },
        {
          sender: user2,
          receiver: user1,
        },
      ],
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

module.exports = router;