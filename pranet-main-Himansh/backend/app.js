const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const issueRoutes = require("./routes/issueRoutes");
const updateRoutes = require("./routes/updateRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/updates", updateRoutes);

module.exports = app;
