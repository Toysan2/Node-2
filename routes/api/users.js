const express = require("express");
const router = express.Router();
const { register, login } = require("../../controllers/authController");
const { authenticateToken } = require("../../middleware/authMiddleware");
const User = require("../../models/userModel");

router.post("/register", async (req, res) => {
  register(req, res);
});

router.post("/login", async (req, res) => {
  login(req, res);
});

router.get("/current", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -token");
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
