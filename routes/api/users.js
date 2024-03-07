const express = require("express");
const router = express.Router();
const User = require("../../models/userModel");
const { authenticateToken } = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");
const fs = require("fs");
const path = require("path");
const jimp = require("jimp");

const authController = require("../../controllers/authController");

router.post("/signup", authController.register);

router.post("/login", authController.login);

router.post("/logout", authenticateToken, (req, res) => {
  res.status(204).send();
});

router.get("/current", authenticateToken, (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
});

router.patch(
  "/avatars",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const avatar = await jimp.read(req.file.path);
      await avatar.resize(250, 250).quality(60);
      const processedFilename = `avatar-${user._id}-${Date.now()}.png`;
      const processedFilePath = path.join(
        "public",
        "avatars",
        processedFilename
      );

      await avatar.writeAsync(processedFilePath);

      user.avatarURL = `/avatars/${processedFilename}`;
      await user.save();

      fs.unlinkSync(req.file.path);

      res.json({ avatarURL: user.avatarURL });
    } catch (error) {
      console.error(error);
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get("/verify/:verificationToken", authController.verifyEmail);

router.post("/verify", authController.resendVerificationEmail);

module.exports = router;
