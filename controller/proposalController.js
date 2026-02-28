const Report = require("../models/reportSchema");
const Proposal = require("../models/Proposal"); // FIXED IMPORT

const providerFile = require("../services/block-chain-provider");
const analyticsDao =
  providerFile.analyticsDao || providerFile.default.analyticsDao;

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.prepareProposal = catchAsync(async (req, res, next) => {
  console.log("req body", req.body);
  const { reportId } = req.body;

  console.log(reportId);
  const report = await Report.findById(reportId);
  if (!report) {
    return next(new AppError("Report not found", 404));
  }

  console.log(report);

  const encodedCall = analyticsDao.interface.encodeFunctionData(
    "recordReport",
    [report.description]
  );

  const proposalRecord = await Proposal.create({
    reportId,
    description: `Approve Report: ${report.title}`,
    target: process.env.ANALYTICS_DAO_ADDRESS,
    calldata: encodedCall,
    value: 0,
  });

  // Update report status to "proposed"
  await Report.findByIdAndUpdate(reportId, { status: "proposed" });

  res.status(200).json({
    success: true,
    proposalDbId: proposalRecord._id,
    target: proposalRecord.target,
    value: proposalRecord.value,
    data: proposalRecord.calldata,
    description: proposalRecord.description,
  });
});

exports.updateProposalId = catchAsync(async (req, res, next) => {
  const { proposalDbId, proposalId } = req.body;
  const address = req.headers["x-wallet-address"];
  console.log(address);
  console.log(proposalDbId);
  console.log(proposalId);

  if (!proposalDbId || !proposalId) {
    return next(new AppError("proposalDbId and proposalId are required", 400));
  }

  const proposal = await Proposal.findByIdAndUpdate(
    proposalDbId,
    { proposalId },
    { new: true, runValidators: true }
  );

  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Proposal ID updated successfully",
    data: {
      proposalDbId: proposal._id,
      proposalId: proposal.proposalId,
    },
  });
});

exports.updateProposalStatus = catchAsync(async (req, res, next) => {
  const { proposalId, status } = req.body;
  console.log(proposalId);
  console.log(status);

  if (!status) {
    return next(new AppError("status is required", 400));
  }

  if (!proposalId) {
    return next(new AppError("proposalId is required", 400));
  }

  // Validate status value
  const validStatuses = [
    "Pending",
    "Active",
    "Canceled",
    "Defeated",
    "Succeeded",
    "Queued",
    "Expired",
    "Executed",
  ];

  // Case-insensitive comparison to find the matching valid status
  const matchedStatus = validStatuses.find(
    (validStatus) => validStatus.toLowerCase() === status.toLowerCase()
  );

  if (!matchedStatus) {
    return next(
      new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400
      )
    );
  }

  // Build query based on which identifier is provided
  const query = { proposalId: proposalId };

  const proposal = await Proposal.findOneAndUpdate(
    query,
    { status: matchedStatus }, // Use the correctly cased status from validStatuses
    { new: true, runValidators: true }
  );

  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Proposal status updated successfully",
    data: {
      proposalDbId: proposal._id,
      proposalId: proposal.proposalId,
      status: proposal.status,
    },
  });
});

exports.vote = catchAsync(async (req, res, next) => {
  const { proposalId, vote } = req.body;
  console.log(proposalId, vote);

  if (!proposalId) {
    return next(new AppError("proposalId is required", 400));
  }

  if (vote === undefined || vote === null) {
    return next(new AppError("vote is required", 400));
  }

  // Validate vote value (0 = Against, 1 = For, 2 = Abstain)
  const validVotes = [0, 1, 2];
  if (!validVotes.includes(Number(vote))) {
    return next(
      new AppError(
        "Invalid vote. Must be 0 (Against), 1 (For), or 2 (Abstain)",
        400
      )
    );
  }

  // Find the proposal first to check if it exists
  const proposal = await Proposal.findOne({ proposalId: proposalId });

  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  // Increment the appropriate vote counter based on vote value
  let updateField = {};
  const voteValue = Number(vote);
  if (voteValue === 0) {
    updateField = { $inc: { votesAgainst: 1 } };
  } else if (voteValue === 1) {
    updateField = { $inc: { votesFor: 1 } };
  } else if (voteValue === 2) {
    updateField = { $inc: { votesAbstain: 1 } };
  }

  const updatedProposal = await Proposal.findOneAndUpdate(
    { proposalId: proposalId },
    updateField,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Vote recorded successfully",
    data: {
      proposalDbId: updatedProposal._id,
      proposalId: updatedProposal.proposalId,
      votesFor: updatedProposal.votesFor,
      votesAgainst: updatedProposal.votesAgainst,
      votesAbstain: updatedProposal.votesAbstain,
    },
  });
});

exports.getAllProposals = catchAsync(async (req, res) => {
  const proposals = await Proposal.find().populate("reportId");
  res.json(proposals);
});
