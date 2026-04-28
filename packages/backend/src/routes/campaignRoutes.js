const express = require("express");
const Campaign = require("../models/Campaign");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:contractAddress", async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      contractAddress: req.params.contractAddress,
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;