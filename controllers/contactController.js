const Contact = require("../models/contactModel");

exports.updateStatusContact = async (contactId, favoriteStatus) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite: favoriteStatus },
      { new: true }
    );

    return updatedContact;
  } catch (error) {
    console.error("Error updating contact status:", error);
    throw error;
  }
};
