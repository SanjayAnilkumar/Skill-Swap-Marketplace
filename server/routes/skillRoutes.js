const express = require("express");
const Skill = require("../models/Skill");

const router = express.Router();

// Add a new skill
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      studentName,
      department,
      year,
      teachSkill,
      learnSkill,
      category,
      experienceLevel,
      description,
      preferredMode,
    } = req.body;

    const newSkill = new Skill({
      userId,
      studentName,
      department,
      year,
      teachSkill,
      learnSkill,
      category,
      experienceLevel,
      description,
      preferredMode,
    });

    const savedSkill = await newSkill.save();

    res.status(201).json({
      message: "Skill added successfully",
      skill: savedSkill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add skill",
      error: error.message,
    });
  }
});

// Get all skills
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch skills",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedSkill = await Skill.findByIdAndDelete(
      req.params.id
    );

    if (!deletedSkill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.status(200).json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete skill",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      teachSkill,
      learnSkill,
      category,
      experienceLevel,
      description,
      preferredMode,
    } = req.body;

    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      {
        teachSkill,
        learnSkill,
        category,
        experienceLevel,
        description,
        preferredMode,
      },
      { new: true }
    );

    if (!updatedSkill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.status(200).json({
      message: "Skill updated successfully",
      skill: updatedSkill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update skill",
      error: error.message,
    });
  }
});

module.exports = router;