const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/authMiddleware");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");

router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", authenticateToken, async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const newContact = await addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:contactId", authenticateToken, async (req, res, next) => {
  try {
    const result = await removeContact(req.params.contactId);
    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", authenticateToken, async (req, res, next) => {
  try {
    const updatedContact = await updateContact(req.params.contactId, req.body);
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch(
  "/:contactId/favorite",
  authenticateToken,
  async (req, res, next) => {
    try {
      const { favorite } = req.body;
      if (favorite === undefined) {
        return res.status(400).json({ message: "missing field favorite" });
      }
      const updatedContact = await updateStatusContact(req.params.contactId, {
        favorite,
      });
      if (!updatedContact) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(updatedContact);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
