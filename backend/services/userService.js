const { db } = require('../firebase/admin');

// Add prescription for a user
const addPrescription = async (userId, prescriptionData) => {
  try {
    const prescriptionRef = db.collection('users').doc(userId).collection('prescriptions').doc();
    await prescriptionRef.set({
      ...prescriptionData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true, id: prescriptionRef.id };
  } catch (error) {
    console.error('Error adding prescription:', error);
    throw error;
  }
};

// Add chat message for a user
const addChatMessage = async (userId, contactId, messageData) => {
  try {
    const chatRef = db.collection('users').doc(userId).collection('chats').doc(contactId);
    await chatRef.set(
      {
        messages: admin.firestore.FieldValue.arrayUnion({
          ...messageData,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        })
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
};

module.exports = { addPrescription, addChatMessage };
