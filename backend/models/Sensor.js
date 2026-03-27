const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  aqi: Number,
  pm25: Number,
  co2: Number,
  nox: Number,
  status: String,
  danger: Boolean,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Sensor", sensorSchema);