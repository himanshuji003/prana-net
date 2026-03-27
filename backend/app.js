const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const issueRoutes = require("./routes/issueRoutes");
const updateRoutes = require("./routes/updateRoutes");
const sensorRoutes = require("./routes/sensorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api/sensor", sensorRoutes);

module.exports = app;
