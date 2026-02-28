const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "config.env") });

const app = require("./app");

// 1. Create HTTP server
const server = http.createServer(app);

// 3. Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ DB connection successful");

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 App running on port ${PORT}`);
    });

    // startExpiryReminderCron();
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });
