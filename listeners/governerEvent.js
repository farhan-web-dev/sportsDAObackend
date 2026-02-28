const { governor } = require("../services/block-chain-provider.js");
const Proposal = require("../models/Proposal.js");

const listenGovernorEvents = () => {
  governor.on(
    "ProposalCreated",
    async (
      proposalId,
      proposer,
      targets,
      values,
      calldatas,
      voteStart,
      voteEnd,
      desc
    ) => {
      console.log("🟦 ProposalCreated:", proposalId.toString());

      await Proposal.findOneAndUpdate(
        { calldata: calldatas[0] },
        { proposalId: proposalId.toString(), status: "ACTIVE" }
      );
    }
  );

  governor.on("ProposalSucceeded", async (proposalId) => {
    await Proposal.findOneAndUpdate({ proposalId }, { status: "SUCCEEDED" });
  });

  governor.on("ProposalQueued", async (proposalId) => {
    await Proposal.findOneAndUpdate({ proposalId }, { status: "QUEUED" });
  });

  governor.on("ProposalExecuted", async (proposalId) => {
    await Proposal.findOneAndUpdate({ proposalId }, { status: "EXECUTED" });
  });
};

module.exports = { listenGovernorEvents };
