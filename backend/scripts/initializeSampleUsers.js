const { admin, db } = require('../firebase/admin');

const sampleUsers = [
  {
    email: 'patient1@example.com',
    password: 'password123',
    name: 'John Doe',
    userType: 'patient',
    additionalInfo: { age: 30, gender: 'Male', bloodGroup: 'O+' }
  },
  {
    email: 'doctor1@example.com',
    password: 'password123',
    name: 'Dr. Smith',
    userType: 'doctor',
    additionalInfo: { specialization: 'Cardiologist', experience: 10 }
  }
];

const initializeSampleUsers = async () => {
  try {
    for (const user of sampleUsers) {
      const userRecord = await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.name
      });

      await db.collection('users').doc(userRecord.uid).set({
        email: user.email,
        name: user.name,
        userType: user.userType,
        additionalInfo: user.additionalInfo,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`User ${user.name} added successfully.`);
    }
  } catch (error) {
    console.error('Error initializing sample users:', error);
  }
};

initializeSampleUsers();
