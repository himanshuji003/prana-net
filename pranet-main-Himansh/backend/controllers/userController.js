const User = require("../models/User");

// Create user
exports.createUser = async (req, res) => {
  try {
    const allowedKeys = ["name", "email", "role", "department"];
    const incomingKeys = Object.keys(req.body || {});
    const unexpectedKeys = incomingKeys.filter(
      (key) => !allowedKeys.includes(key),
    );

    if (unexpectedKeys.length > 0) {
      return res.status(400).json({
        error: `Unexpected fields: ${unexpectedKeys.join(", ")}`,
      });
    }

    const { name, email, role, department } = req.body || {};

    if (typeof name !== "string" || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Name must be a string with at least 2 characters." });
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    if (department !== undefined && typeof department !== "string") {
      return res
        .status(400)
        .json({ error: "Department must be a string when provided." });
    }

    if (
      role !== undefined &&
      !["citizen", "officer", "official"].includes(role)
    ) {
      return res.status(400).json({
        error: "Role must be one of: citizen, officer, official.",
      });
    }

    const sanitizedUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || "citizen",
      ...(department ? { department: department.trim() } : {}),
    };

    const user = await User.create(sanitizedUser);
    res.json(user);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: err.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};
