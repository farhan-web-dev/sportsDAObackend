const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const globalErrorHandler = require("./controller/errorController");
const proposalRouter = require("./routes/proposalRoute");
const reportRouter = require("./routes/reportRoute");
const adminRouter = require("./routes/adminRoute");
const AppError = require("./utils/appError");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:8080", 
      "http://localhost:3000", 
      "http://localhost:5173", 
      "https://dao-frontend-448254913669.us-central1.run.app", 
      "https://dao-admin-448254913669.us-central1.run.app"
    ],
    credentials: true,
  })
);
// Set Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());
// Limit requests from same API
const limiter = rateLimit({
  max: 1000000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP , please try again in an hour",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitizatiion against No SQL query injection
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = mongoSanitize.sanitize(req.body);
  }
  next();
});

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter polluution
// white list updated later
// app.use(hpp());

// Routes
app.use("/api/v1/proposals", proposalRouter);
app.use("/api/v1/reports", reportRouter);
app.use("/api/v1/admin", adminRouter);
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
