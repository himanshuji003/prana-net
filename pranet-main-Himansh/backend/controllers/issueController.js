const Issue = require("../models/Issue");
const mongoose = require("mongoose");

// Create Issue (Citizen)
exports.createIssue = async (req, res) => {
  try {
    const issue = await Issue.create(req.body);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all issues (Official)
exports.getAllIssues = async (req, res) => {
  const issues = await Issue.find()
    .populate("createdBy")
    .populate("assignedTo");
  res.json(issues);
};

// Get issues by citizen
exports.getMyIssues = async (req, res) => {
  const issues = await Issue.find({ createdBy: req.params.userId });
  res.json(issues);
};

// Get single issue by ObjectId or ticket suffix (last 6 chars)
exports.getIssueByReference = async (req, res) => {
  const reference = String(req.params.id || "").trim();

  if (!reference) {
    return res.status(400).json({ error: "Issue reference is required." });
  }

  try {
    let issue = null;

    if (mongoose.Types.ObjectId.isValid(reference)) {
      issue = await Issue.findById(reference)
        .populate("createdBy")
        .populate("assignedTo");
    }

    if (!issue) {
      const tokenPart = reference.replace(/^TKN-/i, "").toLowerCase();
      const issues = await Issue.find()
        .populate("createdBy")
        .populate("assignedTo")
        .sort({ createdAt: -1 })
        .limit(500);

      issue =
        issues.find((item) => String(item._id).toLowerCase().endsWith(tokenPart)) || null;
    }

    if (!issue) {
      return res.status(404).json({ error: "Issue not found." });
    }

    return res.json(issue);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch issue details." });
  }
};

// Assign officer (Official)
exports.assignIssue = async (req, res) => {
  const { officerId } = req.body;

  const issue = await Issue.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo: officerId,
      status: "assigned",
    },
    { new: true },
  );

  res.json(issue);
};

// Update status (Officer)
exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "assigned",
    "in_progress",
    "resolved",
    "closed",
  ];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!issue) {
      return res.status(404).json({ error: "Issue not found." });
    }

    return res.json(issue);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to update issue status." });
  }
};
