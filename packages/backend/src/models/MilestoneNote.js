const mongoose = require("mongoose");

const milestoneNoteSchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    milestoneIndex: { type: Number, required: true },
    title: { type: String, required: true },
    note: { type: String, required: true },
    evidenceUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MilestoneNote", milestoneNoteSchema);