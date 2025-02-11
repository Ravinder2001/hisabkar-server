const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const moment = require("moment");

// const { Server } = require("socket.io");

const mainRouter = require("./routes/routes");
const config = require("./configuration/config");

require("./jobs/cronJob");
require("./configuration/db");

const port = config.PORT;

const app = express();

const corsOptions = {
  origin: "*", // Allow requests from this org
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allow only GET and POST requests
  optionsSuccessStatus: 200, // Some le gacy browsers (IE11, various SmartTVs) choke on 204
};

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

morgan.token("ist-date", () => {
  return moment().utcOffset("+05:30").format("DD/MMM/YYYY:HH:mm:ss Z");
});

// Define user ID custom token
morgan.token("user", (req) => {
  return req.userId || "Guest";
});

app.use(cors(corsOptions));
app.use(limiter);
app.disable("x-powered-by"); // Disable the X-Powered-By header

// ? Passport initialization
app.use(passport.initialize());

// Middleware
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Middleware to set Cache-Control header for all routes
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store");
  next();
});

app.use((req, res, next) => {
  const userId = req.headers["x-user-id"]; // Extract custom header
  if (userId) {
    req.userId = userId; // Attach it to the request object
  }
  next();
});

app.use(morgan(":method :url :status - userId: :user - :ist-date"));

app.use("/", mainRouter);

const webpush = require("web-push");
// Replace with your generated VAPID keys
const publicVapidKey = "BLQ5bMG3fW57qAkWCn4oRCLQCFky8Lbx4ZsTLZfXgpXzfTnnc9mYgVM2huTesGq_9FFDCMGu7KUppEnUO7VcqT0";
const privateVapidKey = "ktZgvqA37BPPYpQRqJB7YXaivmXzi4r_ZpGmeU4tWEk";

webpush.setVapidDetails("mailto:test@example.com", publicVapidKey, privateVapidKey);

let subscriptions = []; // Store subscriptions

// Endpoint to subscribe a user
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log("🚀  subscriptions:", subscriptions);
  res.status(201).json({});
});

// Send a push notification to all subscribers
app.post("/sendNotification", async (req, res) => {
  const payload = JSON.stringify({
    title: "New Message!",
    body: "You have a new notification.",
  });

  console.log("🚀  subscriptions for each", subscriptions);
  subscriptions.forEach((sub) => {
    webpush.sendNotification(sub, payload).catch((err) => console.error(err));
  });

  res.status(200).json({ message: "Notification sent" });
});

app.listen(port, () => {
  process.stdout.write(`Server is running on port ${port}\n`);
});
