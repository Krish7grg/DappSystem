const express = require("express");
const Activity = require("../models/Activity");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:contractAddress", async (req, res) => {
  try {
    const activities = await Activity.find({
      contractAddress: req.params.contractAddress,
    }).sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;