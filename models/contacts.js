const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    favorite: { type: Boolean, default: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

async function listContacts(userId) {
  return await Contact.find({ owner: userId });
}

async function getContactById(contactId, userId) {
  return await Contact.findOne({ _id: contactId, owner: userId });
}

async function addContact(contactData) {
  const contact = new Contact(contactData);
  await contact.save();
  return contact;
}

async function updateContact(contactId, userId, updateData) {
  return await Contact.findOneAndUpdate(
    { _id: contactId, owner: userId },
    updateData,
    { new: true }
  );
}

async function removeContact(contactId, userId) {
  return await Contact.findOneAndDelete({ _id: contactId, owner: userId });
}

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
};
