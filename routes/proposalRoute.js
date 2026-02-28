const express = require("express");
const {
  prepareProposal,
  getAllProposals,
  updateProposalId,
  updateProposalStatus,
  vote,
} = require("../controller/proposalController");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

router.get("/all-proposals", getAllProposals);

router.post("/prepare-proposal", isAdmin, prepareProposal);

router.post("/update-proposal-id", isAdmin, updateProposalId);

router.patch("/update-proposal-status", isAdmin, updateProposalStatus);

router.post("/vote", vote);

module.exports = router;
