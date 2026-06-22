const express = require("express");
const adminController = require("../controller/adminController");

const router = express.Router();

router.get("/dashboard-stats", adminController.getDashboardStats);

router.post("/check-admin", (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress)
    return res.status(400).json({ error: "walletAddress required" });

  const admin = process.env.ADMIN_WALLET.toLowerCase();
  const user = walletAddress.toLowerCase();

  if (admin === user) {
    return res.json({ isAdmin: true });
  }

  return res.json({ isAdmin: false });
});

module.exports = router;
