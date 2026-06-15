const Report = require("../models/reportSchema");
const { uploadBufferToIPFS } = require("../utils/ipfs");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const FormData = require("form-data");
const axios = require("axios").default || require("axios");

const formatReport = (report) => {
  if (!report) return report;
  const obj = report.toObject ? report.toObject() : { ...report._doc };
  if (obj.fileIpfsHash) {
    const hash = obj.fileIpfsHash.startsWith("ipfs://") 
      ? obj.fileIpfsHash.substring(7) 
      : obj.fileIpfsHash;
    obj.ipfsLink = `https://ipfs.io/ipfs/${hash}`;
  }
  return obj;
};

const analyzeReportWithAi = async (reportId, fileBuffer, fileName, fileMimeType) => {
  try {
    console.log(`[AI Analysis] Starting fact-checking for report ${reportId}...`);
    const fileExt = fileName.split(".").pop().toLowerCase();
    const contentType = fileExt === "pdf" ? "application/pdf" : "text/plain";

    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: fileName,
      contentType: contentType,
    });

    const response = await axios.post(
      "https://limacharlie-cricket-truth-o-meter.hf.space/api/v1/verify/file",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 120000, // 2 minutes timeout to account for cold starts
      }
    );

    if (response.status === 200 && response.data) {
      await Report.findByIdAndUpdate(reportId, {
        aiResults: {
          status: "success",
          filename: response.data.filename,
          fileSizeKb: response.data.file_size_kb,
          claimsFound: response.data.claims_found,
          verdicts: response.data.verdicts,
        },
      });
      console.log(`[AI Analysis] Fact-checking succeeded for report ${reportId}`);
    } else {
      await Report.findByIdAndUpdate(reportId, {
        aiResults: {
          status: "failed",
          error: `AI space returned status: ${response.status}`,
        },
      });
      console.error(`[AI Analysis] AI space returned non-200 status for report ${reportId}: ${response.status}`);
    }
  } catch (error) {
    const errMsg = error.response && error.response.data && error.response.data.detail
      ? JSON.stringify(error.response.data.detail)
      : error.message;
    console.error(`[AI Analysis] Error analyzing report ${reportId}:`, errMsg);
    await Report.findByIdAndUpdate(reportId, {
      aiResults: {
        status: "failed",
        error: errMsg || "Failed to contact AI model space",
      },
    });
  }
};

exports.createReport = catchAsync(async (req, res, next) => {
  const { creator, title, description, price } = req.body;
  if (!req.file) {
    return next(new AppError("file required", 400));
  }

  // Validate that the file is a PDF or TXT
  const fileExt = req.file.originalname.split(".").pop().toLowerCase();
  if (fileExt !== "pdf" && fileExt !== "txt") {
    return next(new AppError("Only PDF and TXT files are allowed. The AI fact-checking engine is designed for PDF and TXT documents.", 400));
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
    aiResults: { status: "pending" },
  });

  // Run AI analysis in the background
  analyzeReportWithAi(report._id, req.file.buffer, req.file.originalname, req.file.mimetype)
    .catch((err) => console.error("Unhandled error in analyzeReportWithAi:", err));

  res.status(201).json({
    status: "success",
    data: {
      report: formatReport(report),
    },
  });
});

// Get all pending reports (admin only)
exports.getPendingReports = catchAsync(async (req, res, next) => {
  const pendingReports = await Report.find({ status: "pending" });
  const formatted = pendingReports.map(formatReport);
  res.status(200).json({
    status: "success",
    results: formatted.length,
    data: formatted,
  });
});

exports.getReportById = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError("Report not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: formatReport(report),
  });
});
