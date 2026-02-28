const mongoose = require("mongoose");

const ProposalSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
  proposalId: String, // set later when DAO creates proposal
  description: String,
  target: String,
  calldata: String,
  value: Number,
  votesFor: { type: Number, default: 0 },
  votesAgainst: { type: Number, default: 0 },
  votesAbstain: { type: Number, default: 0 },
  status: {
    type: String,
    enum: [
      "Pending",
      "Active",
      "Canceled",
      "Defeated",
      "Succeeded",
      "Queued",
      "Expired",
      "Executed",
    ],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Proposal", ProposalSchema);
