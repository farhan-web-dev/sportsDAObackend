const Report = require("../models/reportSchema");
const { uploadBufferToIPFS } = require("../utils/ipfs");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createReport = catchAsync(async (req, res, next) => {
  const { creator, title, description, price } = req.body;
  if (!req.file) {
    return next(new AppError("file required", 400));
  }

  const fileIpfsHash = await uploadBufferToIPFS(
    req.file.buffer,
    req.file.originalname
  );

  const report = await Report.create({
    creator,
    title,
    description,
    price,
    fileIpfsHash,
    timestamp: Date.now(),
    status: "pending",
  });

  res.status(201).json({
    status: "success",
    data: {
      report,
    },
  });
});

// Get all pending reports (admin only)
exports.getPendingReports = catchAsync(async (req, res, next) => {
  const pendingReports = await Report.find({ status: "pending" });
  // console.log(pendingReports);
  res.status(200).json({
    status: "success",
    results: pendingReports.length,
    data: pendingReports,
  });
});

exports.getReportById = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError("Report not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: report,
  });
});
