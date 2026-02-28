const express = require("express");
const {
  createReport,
  getPendingReports,
  getReportById,
} = require("../controller/reportController");
const { isAdmin } = require("../middleware/isAdmin");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/createReport", upload.single("file"), createReport);

// Admin can view pending reports
router.get("/pending", isAdmin, getPendingReports);

// Admin can view details of a specific report
router.get("/:id", isAdmin, getReportById);

module.exports = router;
