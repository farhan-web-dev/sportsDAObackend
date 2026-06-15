const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABIs
const governorABI = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../abis/GovernerContract.json"))
);
const marketplaceABI = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../abis/Marketplace.json"))
);
const analyticsABI = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../abis/AnalyticsDAO.json"))
);
const fansTokenABI = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../abis/FanzToken.json"))
);

// Safety checks
if (!process.env.SEPOLIA_RPC_URL)
  throw new Error("SEPOLIA_RPC_URL missing in .env");
if (!process.env.GOVERNOR_ADDRESS)
  throw new Error("GOVERNOR_ADDRESS missing in .env");
if (!process.env.MARKETPLACE_ADDRESS)
  throw new Error("MARKETPLACE_ADDRESS missing in .env");
if (!process.env.ANALYTICS_DAO_ADDRESS)
  throw new Error("ANALYTICS_DAO_ADDRESS missing in .env");
if (!process.env.FZ_TOKEN_ADDRESS)
  throw new Error("FZ_TOKEN_ADDRESS missing in .env");

// Provider
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// Contracts
const governor = new ethers.Contract(
  process.env.GOVERNOR_ADDRESS,
  governorABI.abi,
  provider
);
const marketplace = new ethers.Contract(
  process.env.MARKETPLACE_ADDRESS,
  marketplaceABI.abi,
  provider
);
const analyticsDao = new ethers.Contract(
  process.env.ANALYTICS_DAO_ADDRESS,
  analyticsABI.abi,
  provider
);
const token = new ethers.Contract(
  process.env.FZ_TOKEN_ADDRESS,
  fansTokenABI.abi,
  provider
);

module.exports = { governor, marketplace, analyticsDao, token };
