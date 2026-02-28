export const isAdmin = (req, res, next) => {
  try {
    const wallet = req.headers["x-wallet-address"];

    if (!wallet) return res.status(400).json({ msg: "Wallet address missing" });

    const adminWallet = process.env.ADMIN_WALLET.toLowerCase();

    if (wallet.toLowerCase() !== adminWallet)
      return res.status(403).json({ msg: "Not authorized (not admin)" });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Admin check failed" });
  }
};
