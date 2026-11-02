
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      year,
    } = req.body;

    const normalizedEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    if (
      !name ||
      !normalizedEmail ||
      !password ||
      !department ||
      !year
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      department,
      year,
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

// Get user details by ID
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name email department year"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
});

// Update profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      department,
      year,
      bio,
      profilePicture,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof department !== "string" ||
      !department.trim() ||
      typeof year !== "string" ||
      !year.trim()
    ) {
      return res.status(400).json({
        message: "Name, department, and year are required",
      });
    }

    if (bio !== undefined && typeof bio !== "string") {
      return res.status(400).json({
        message: "Bio must be text",
      });
    }

    if (
      profilePicture !== undefined &&
      typeof profilePicture !== "string"
    ) {
      return res.status(400).json({
        message: "Profile picture must be a URL string",
      });
    }

    if (bio !== undefined && bio.length > 300) {
      return res.status(400).json({
        message: "Bio must be 300 characters or less",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          name: name.trim(),
          department: department.trim(),
          year: year.trim(),
          ...(bio !== undefined ? { bio: bio.trim() } : {}),
          ...(profilePicture !== undefined
            ? { profilePicture: profilePicture.trim() }
            : {}),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("name email department year bio profilePicture");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error.message);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

// Forgot Password: send reset email
router.post("/forgot-password", async (req, res) => {
  const genericMessage =
    "If an account exists with that email, a password reset link has been sent.";

  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return res.status(200).json({
        message: genericMessage,
      });
    }

    const user = await User.findOne({ email });

    // Temporary diagnostic: never print email addresses or tokens.
    console.log(
      "[Password Reset] Account found:",
      Boolean(user)
    );

    if (!user) {
      return res.status(200).json({
        message: genericMessage,
      });
    }

    // Generate a random token and store only its SHA-256 hash.
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      !process.env.FRONTEND_URL
    ) {
      console.error(
        "[Password Reset] Required email environment settings are missing."
      );

      return res.status(500).json({
        message: "Email service is not configured correctly.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const info = await transporter.sendMail({
      from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your SkillSwap password",
      text: `Hello ${user.name},

We received a request to reset your SkillSwap password.

Open this link to choose a new password:
${resetUrl}

This link expires in 15 minutes and can only be used once.

If you did not request this, you can ignore this email.`,
    });

    // Temporary diagnostic output.
    console.log(
      "[Password Reset] SMTP accepted email:",
      info.accepted?.length > 0
    );

    console.log(
      "[Password Reset] Rejected recipient count:",
      info.rejected?.length ?? 0
    );

    return res.status(200).json({
      message: genericMessage,
    });
  } catch (error) {
    // Do not log the reset token, reset URL, or email credentials.
    console.error(
      "[Password Reset] Email sending failed:",
      error.code || error.name || "Unknown error",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to send the reset email right now. Please try again later.",
    });
  }
});

// Reset Password: validate token and save new password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        message: "This reset link is invalid or expired.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or expired.",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    // Invalidate the token after successful use.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error(
      "[Password Reset] Password update failed:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to reset your password right now. Please try again.",
    });
  }
});

module.exports = router;
