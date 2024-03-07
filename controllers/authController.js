const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const gravatar = require("gravatar");
const sgMail = require("../config/sendgridConfig");
const { v4: uuidv4 } = require("uuid");

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
      return res.status(409).json({ message: "Email in use" });
    }

    const avatarURL = gravatar.url(value.email, { s: "200", r: "pg", d: "mm" });
    const encryptedPassword = await bcrypt.hash(value.password, 10);
    const verificationToken = uuidv4();

    const user = await User.create({
      email: value.email,
      password: encryptedPassword,
      avatarURL,
      subscription: "starter",
      verify: false,
      verificationToken,
    });

    const verificationLink = `${req.protocol}://${req.get(
      "host"
    )}/users/verify/${verificationToken}`;

    const message = {
      to: value.email,
      from: "toysan3@hotmail.com",
      subject: "Verify your email address",
      text: `Please click on the following link to verify your email address: ${verificationLink}`,
      html: `<p>Please click on the following link to verify your email address: <a href="${verificationLink}">${verificationLink}</a></p>`,
    };

    await sgMail.send(message);

    res
      .status(201)
      .json({ message: "User registered. Please verify your email." });
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
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    if (!user.verify) {
      return res
        .status(403)
        .json({ message: "Email not verified. Please verify your email." });
    }

    if (await bcrypt.compare(value.password, user.password)) {
      const token = jwt.sign(
        { user_id: user._id, email: value.email },
        process.env.TOKEN_SECRET,
        { expiresIn: "2h" }
      );

      res.status(200).json({
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      });
    } else {
      res.status(401).json({ message: "Email or password is wrong" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.verificationToken,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "missing required field email" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const verificationLink = `${req.protocol}://${req.get(
      "host"
    )}/users/verify/${user.verificationToken}`;

    const message = {
      to: email,
      from: "toysan3@hotmail.com", // Upewnij się, że używasz tu swojego adresu zweryfikowanego przez SendGrid
      subject: "Verify your email address",
      text: `Please click on the following link to verify your email address: ${verificationLink}`,
      html: `<p>Please click on the following link to verify your email address: <a href="${verificationLink}">${verificationLink}</a></p>`,
    };

    await sgMail.send(message);

    res.status(200).json({ message: "Verification email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
