const express = require("express");
const router = express.Router();
const { register, login } = require("../../controllers/authController");
const { authenticateToken } = require("../../middleware/authMiddleware");
const User = require("../../models/userModel");

// POST route for user registration
router.post("/register", async (req, res) => {
  register(req, res);
});

// POST route for user login
router.post("/login", async (req, res) => {
  login(req, res);
});

// GET route for fetching current user's profile
router.get("/current", authenticateToken, async (req, res) => {
  try {
    // Since authenticateToken middleware is used, req.user is already populated
    const user = await User.findById(req.user._id).select("-password -token"); // Exclude sensitive information
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
