const IssueUpdate = require("../models/IssueUpdate");
const mongoose = require("mongoose");

// Add update/comment
exports.addUpdate = async (req, res) => {
  try {
    const update = await IssueUpdate.create(req.body);
    res.json(update);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get updates for an issue
exports.getUpdates = async (req, res) => {
  const { issueId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(issueId)) {
    return res.status(400).json({ error: "Invalid issueId" });
  }

  try {
    const updates = await IssueUpdate.find({
      issueId,
    }).populate("userId");

    return res.json(updates);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch updates" });
  }
};
