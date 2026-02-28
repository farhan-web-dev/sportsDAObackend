const DaoReport = require("../models/DaoReport");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllDaoReports = catchAsync(async (req, res, next) => {
  const daoReports = await DaoReport.find();

  if (daoReports.length === 0) {
    return next(new AppError("No DAO Reports found", 404));
  }

  res.status(200).json({
    status: "success",
    results: daoReports.length,
    data: {
      daoReports,
    },
  });
});
