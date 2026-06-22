const Report = require("../models/reportSchema");
const Proposal = require("../models/Proposal");
const catchAsync = require("../utils/catchAsync");

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const totalReports = await Report.countDocuments();
  const pendingReports = await Report.countDocuments({ status: "pending" });
  
  const activeProposals = await Proposal.countDocuments({ status: "Active" });
  const executedProposals = await Proposal.countDocuments({ status: "Executed" });

  // Status Data for Pie Chart
  const statusCounts = await Proposal.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  
  const colorMap = {
    "Active": "hsl(var(--chart-1))",
    "Executed": "hsl(var(--chart-2))",
    "Defeated": "hsl(var(--chart-3))",
    "Pending": "hsl(var(--chart-4))",
    "Succeeded": "hsl(var(--chart-5))",
    "Canceled": "hsl(var(--chart-1))",
    "Queued": "hsl(var(--chart-2))",
    "Expired": "hsl(var(--chart-3))",
  };

  const statusData = statusCounts.map(item => ({
    name: item._id,
    value: item.count,
    color: colorMap[item._id] || "hsl(var(--chart-1))"
  }));

  // Aggregating reports by month
  const reports = await Report.find({}, "timestamp status");
  const reportMonths = {};
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  reports.forEach(report => {
    const d = report.timestamp ? new Date(report.timestamp) : new Date();
    const month = monthNames[d.getMonth()];
    if (!reportMonths[month]) {
      reportMonths[month] = { month, pending: 0, approved: 0, rejected: 0 };
    }
    if (report.status === "pending") reportMonths[month].pending += 1;
    else if (report.status === "approved" || report.status === "proposed") reportMonths[month].approved += 1;
    else reportMonths[month].rejected += 1; 
  });
  
  const reportsData = Object.values(reportMonths);

  // Aggregating proposals by month
  const proposals = await Proposal.find({}, "createdAt status");
  const proposalMonths = {};
  
  proposals.forEach(prop => {
    const d = prop.createdAt ? new Date(prop.createdAt) : new Date();
    const month = monthNames[d.getMonth()];
    if (!proposalMonths[month]) {
      proposalMonths[month] = { month, active: 0, executed: 0, defeated: 0 };
    }
    if (prop.status === "Active" || prop.status === "Pending") proposalMonths[month].active += 1;
    else if (prop.status === "Executed" || prop.status === "Succeeded") proposalMonths[month].executed += 1;
    else if (prop.status === "Defeated" || prop.status === "Canceled" || prop.status === "Expired") proposalMonths[month].defeated += 1;
  });
  
  const proposalsData = Object.values(proposalMonths);

  res.status(200).json({
    status: "success",
    data: {
      totalReports,
      pendingReports,
      activeProposals,
      executedProposals,
      reportsData,
      proposalsData,
      statusData
    }
  });
});
