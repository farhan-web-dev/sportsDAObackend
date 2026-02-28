const mongoose = require("mongoose");

const DAOReportSchema = new mongoose.Schema({
  onChainId: Number, // ID from AnalyticsDAO (reportCount)
  proposalId: String, // which proposal executed
  content: String, // full report text from DAO
  creator: String, // proposer wallet address
  timestamp: Number, // from blockchain
});

module.exports = mongoose.model("DAOReport", DAOReportSchema);
