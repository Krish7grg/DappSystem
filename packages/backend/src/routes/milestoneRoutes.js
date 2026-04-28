const express = require("express");
const MilestoneNote = require("../models/MilestoneNote");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const note = await MilestoneNote.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:contractAddress", async (req, res) => {
  try {
    const notes = await MilestoneNote.find({
      contractAddress: req.params.contractAddress,
    }).sort({ milestoneIndex: 1, createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;