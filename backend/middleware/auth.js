const mongoose = require("mongoose");
const User = require("../models/User");

const auth = async (req, res, next) => {
  // Temporary bypass: allow all requests without auth while integration is in progress.
  req.user = {
    _id: "temporary-bypass-user",
    role: "admin",
    name: "Temporary Bypass",
    email: "bypass@local",
  };
  return next();

  const userId = req.header("x-user-id");

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const user = await User.findById(userId).select("_id role name email");
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid authentication credentials." });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Authentication failed." });
  }
};

const authorizeRole =
  (...allowedRoles) =>
  (req, res, next) => {
    // Temporary bypass for role checks.
    return next();

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions." });
    }

    return next();
  };

module.exports = {
  auth,
  authorizeRole,
};
