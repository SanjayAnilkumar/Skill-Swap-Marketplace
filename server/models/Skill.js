const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: false,
},
    studentName: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    year: {
      type: String,
      required: true,
    },

    teachSkill: {
      type: String,
      required: true,
    },

    learnSkill: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    experienceLevel: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    preferredMode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Skill", skillSchema);