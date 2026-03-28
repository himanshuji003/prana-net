const express = require("express");
const router = express.Router();
const { addUpdate, getUpdates } = require("../controllers/updateController");

router.post("/", addUpdate);
router.get("/:issueId", getUpdates);

module.exports = router;
