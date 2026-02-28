const express = require("express");
const { getAllDaoReports } = require("../controller/daoReportController");

const router = express.Router();

router.get("/", getAllDaoReports);

module.exports = router;
