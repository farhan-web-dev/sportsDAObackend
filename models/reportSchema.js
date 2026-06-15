const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  creator: String,
  title: String,
  description: String,
  fileIpfsHash: String,
  timestamp: Number,
  status: { type: String, default: "pending" }, // pending → proposed → approved
  proposalId: String, // set later when DAO creates proposal
  marketplaceMinted: { type: Boolean, default: false },
  price: { type: Number, required: false },
  aiResults: {
    type: mongoose.Schema.Types.Mixed,
    default: { status: "pending" },
  },
});

module.exports = mongoose.model("Report", ReportSchema);
