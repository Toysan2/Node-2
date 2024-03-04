const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

exports.register = async (req, res) => {
  try {
    const { value, error } = authSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const oldUser = await User.findOne({ email: value.email });
    if (oldUser) {
      return res
        .status(409)
        .json({ message: "User Already Exist. Please Login" });
    }

    const encryptedPassword = await bcrypt.hash(value.password, 10);

    const user = await User.create({
      email: value.email,
      password: encryptedPassword,
    });

    const token = jwt.sign(
      { user_id: user._id, email: value.email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );

    user.token = token;

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { value, error } = authSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email: value.email });
    if (user && (await bcrypt.compare(value.password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email: value.email },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "2h",
        }
      );

      user.token = token;

      res.status(200).json(user);
    } else {
      res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
