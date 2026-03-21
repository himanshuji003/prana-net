const Issue = require("../models/Issue");

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
