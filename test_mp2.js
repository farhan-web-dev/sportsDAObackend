const { ethers } = require("ethers");
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/5c300a194498431384650c5e84f5c4bd");
const marketplaceABI = [{"inputs":[],"name":"nextReportId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"uint256","name":"reportId","type":"uint256"}],"name":"getReport","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"bool","name":"listed","type":"bool"}],"internalType":"struct Marketplace.ReportItem","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}];
const contract = new ethers.Contract("0x0e3448a8FA34c5F8104860BcA05ffd27281bf202", marketplaceABI, provider);

async function main() {
  const nextId = await contract.nextReportId();
  console.log("nextReportId:", nextId.toString());
  for (let i = 1; i <= Number(nextId); i++) {
    const report = await contract.getReport(i);
    console.log(`Report ${i}:`, report);
  }
}
main().catch(console.error);
