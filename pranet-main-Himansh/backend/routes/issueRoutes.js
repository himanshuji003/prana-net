const express = require("express");
const router = express.Router();
const {
  createIssue,
  getAllIssues,
  getMyIssues,
  getIssueByReference,
  assignIssue,
  updateStatus,
} = require("../controllers/issueController");
const { auth, authorizeRole } = require("../middleware/auth");

router.post("/", auth, createIssue);
router.get("/", getAllIssues);
router.get("/user/:userId", getMyIssues);
router.get("/:id", getIssueByReference);
router.put(
  "/:id/assign",
  auth,
  authorizeRole("officer", "official", "admin"),
  assignIssue,
);
router.put(
  "/:id/status",
  auth,
  authorizeRole("officer", "official", "admin"),
  updateStatus,
);

module.exports = router;
