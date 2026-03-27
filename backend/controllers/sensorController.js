const Sensor = require("../models/Sensor");

// POST (ESP will send data)
exports.addSensorData = async (req, res) => {
  try {
    const data = await Sensor.create(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET latest data
exports.getLatest = async (req, res) => {
  const data = await Sensor.findOne().sort({ createdAt: -1 });
  res.json(data);
};
