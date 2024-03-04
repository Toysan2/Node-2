const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    try {
      const user = await User.findById(decoded.user_id);
      if (!user) {
        return res.sendStatus(404);
      }

      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  });
};

module.exports = { authenticateToken };
