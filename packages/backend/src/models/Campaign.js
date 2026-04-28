const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    ownerAddress: { type: String, required: true },
    contractAddress: { type: String, required: true, unique: true },
    goalEth: { type: Number, required: true },
    deadline: { type: String, required: true },
    status: { type: String, default: "Open" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);