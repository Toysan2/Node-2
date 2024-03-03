require("dotenv").config({ path: "./.env.credentials" });
const mongoose = require("mongoose");
const { Schema } = mongoose;

const dbUser = process.env.DB_USER;
const dbPassword = encodeURIComponent(process.env.DB_PASSWORD);
const dbHost = process.env.DB_HOST;

const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/`;

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successful"))
  .catch((err) => {
    console.error("Database connection error", err);
    process.exit(1);
  });

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

const listContacts = async () => await Contact.find();
const getContactById = async (contactId) => await Contact.findById(contactId);
const removeContact = async (contactId) =>
  await Contact.findByIdAndRemove(contactId);
const addContact = async (body) => {
  const contact = new Contact(body);
  await contact.save();
  return contact;
};
const updateContact = async (contactId, body) =>
  await Contact.findByIdAndUpdate(contactId, body, { new: true });
const updateStatusContact = async (contactId, body) =>
  await Contact.findByIdAndUpdate(
    contactId,
    { favorite: body.favorite },
    { new: true }
  );

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
