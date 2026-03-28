const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const issueRoutes = require("./routes/issueRoutes");
const updateRoutes = require("./routes/updateRoutes");
const sensorRoutes = require("./routes/sensorRoutes");

const app = express();

const defaultAllowedOrigins = [
  "https://prena-net.netlify.app",
  "http://localhost:5173",
];

const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins =
  configuredOrigins.length > 0 ? configuredOrigins : defaultAllowedOrigins;

const isOriginAllowed = (origin) => {
  if (allowedOrigins.length === 0) {
    return true;
  }

  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return false;
  }

  return allowedOrigins.some((entry) => {
    if (!entry.includes("*")) {
      return entry === origin || entry === parsedOrigin.hostname;
    }

    if (entry === "*.netlify.app") {
      return parsedOrigin.hostname.endsWith(".netlify.app");
    }

    if (entry === "https://*.netlify.app") {
      return (
        parsedOrigin.protocol === "https:" &&
        parsedOrigin.hostname.endsWith(".netlify.app")
      );
    }

    return false;
  });
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients and same-origin requests without Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked for this origin"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  }),
);
app.use(express.json());

app.get("/health", (req, res) => {
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbReadyState = mongoose.connection.readyState;
  const dbStatus = stateMap[dbReadyState] || "unknown";

  res.status(dbReadyState === 1 ? 200 : 503).json({
    ok: dbReadyState === 1,
    service: "prana-net-api",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    db: {
      status: dbStatus,
      readyState: dbReadyState,
      name: mongoose.connection.name || null,
    },
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "prana-net-api",
    message: "API is running",
  });
});

app.get("/api/test", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Test route working",
    time: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api/sensor", sensorRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  if (err && err.message === "CORS blocked for this origin") {
    return res.status(403).json({ ok: false, error: err.message });
  }

  console.error("Unhandled server error", err);
  return res.status(500).json({ ok: false, error: "Internal server error" });
});

module.exports = app;
