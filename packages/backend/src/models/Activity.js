const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true },
    contractAddress: { type: String, required: true },
    action: { type: String, required: true },
    txHash: { type: String, default: "" },
    details: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);