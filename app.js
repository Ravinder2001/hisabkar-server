const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const moment = require("moment");
const helmet = require("helmet");

// const { Server } = require("socket.io");

const mainRouter = require("./routes/routes");
const config = require("./configuration/config");
const Messages = require("./utils/constant/messages");
const { encryptData } = require("./utils/encryption");

require("./jobs/cronJob");
require("./configuration/db");

const port = config.PORT;

const app = express();

const corsOptions = {
  origin: "*", // Allow requests from this org
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allow only GET and POST requests
  optionsSuccessStatus: 200, // Some le gacy browsers (IE11, various SmartTVs) choke on 204
};

morgan.token("ist-date", () => {
  return moment().utcOffset("+05:30").format("DD/MMM/YYYY:HH:mm:ss Z");
});

// Define user ID custom token
morgan.token("user", (req) => {
  return req.userId || "Guest";
});

app.use(cors(corsOptions));
app.disable("x-powered-by"); // Disable the X-Powered-By header
app.use(helmet());
// app.use(encryptResponseMiddleware);
app.use((req, res, next) => {
  const originalSend = res.json; // Store original res.json

  res.json = function (data) {
    if (process.env.NODE_ENV === "prod") {
      const encryptedData = encryptData(data.data);
      originalSend.call(this, {
        ...data,
        data: encryptedData,
      });
    } else {
      originalSend.call(this, data);
    }
  };

  next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Allow only the same origin (your server)
      scriptSrc: ["'self'"], // Only allow scripts from your domain
      styleSrc: ["'self'"], // Only allow styles from your domain
      imgSrc: ["'self'"], // Only allow images from your domain
      connectSrc: ["'self'"], // Allow only API requests to your domain
      frameAncestors: ["'none'"], // Block Clickjacking (no iframes)
    },
  })
);

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

// Handle JSON syntax errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: Messages.INVALID_JSON, message: err.message });
  }
  next();
});

app.use(morgan(":method :url :status - userId: :user - :ist-date"));

app.use("/", mainRouter);

app.listen(port, () => {
  process.stdout.write(`Server is running on port ${port}\n`);
});
