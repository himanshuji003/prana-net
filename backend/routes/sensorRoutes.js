const express = require("express");
const router = express.Router();
const { addSensorData, getLatest } = require("../controllers/sensorController");

router.post("/data", addSensorData);
router.get("/latest", getLatest);

module.exports = router;
