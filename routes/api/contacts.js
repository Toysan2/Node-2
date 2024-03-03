const express = require("express");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
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

router.post("/", async (req, res, next) => {
  try {
    const newContact = await addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:contactId", async (req, res, next) => {
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

router.put("/:contactId", async (req, res, next) => {
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

router.patch("/:contactId/favorite", async (req, res, next) => {
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
});

module.exports = router;
