const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    role: {
      type: String,
      enum: ["citizen", "officer", "official"],
    },
    department: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
