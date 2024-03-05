const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/authMiddleware");
const Contact = require("../../models/contactModel");
const { body, validationResult } = require("express-validator");
const { updateStatusContact } = require("../../controllers/contactController"); // Zaimportuj funkcję

router.get("/", authenticateToken, async (req, res) => {
  try {
    const contacts = await Contact.find({ owner: req.user._id });
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:contactId", authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.contactId,
      owner: req.user._id,
    });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post(
  "/",
  authenticateToken,
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").not().isEmpty().withMessage("Phone is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newContact = new Contact({ ...req.body, owner: req.user._id });
      await newContact.save();
      res.status(201).json(newContact);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.delete("/:contactId", authenticateToken, async (req, res) => {
  try {
    const result = await Contact.findOneAndDelete({
      _id: req.params.contactId,
      owner: req.user._id,
    });
    if (!result) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json({ message: "Contact deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/:contactId", authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/:contactId/favorite", authenticateToken, async (req, res) => {
  // Make sure to authenticate this route as well
  try {
    const { favorite } = req.body;
    if (favorite === undefined) {
      return res.status(400).json({ message: "missing field favorite" });
    }
    const updatedContact = await updateStatusContact(
      req.params.contactId,
      favorite
    ); // Adjusted to pass favorite directly
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(updatedContact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
