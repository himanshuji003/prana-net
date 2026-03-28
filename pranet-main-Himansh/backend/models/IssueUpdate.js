const mongoose = require("mongoose");

const updateSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: String,
    statusUpdate: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("IssueUpdate", updateSchema);
