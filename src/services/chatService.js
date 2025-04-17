/**
 * Mock Chat Service
 * This simulates a backend service for chat functionality
 */

// In-memory storage for conversations
const conversationsStore = {
  patient: {
    1: [
      { id: 1, sender: "doctor", text: "Hello! How can I help you today?", timestamp: "2023-06-15 14:30", read: true },
      { id: 2, sender: "patient", text: "I've been experiencing headaches for the past week.", timestamp: "2023-06-15 14:32", read: true },
      { id: 3, sender: "doctor", text: "I see. How severe are these headaches on a scale of 1-10?", timestamp: "2023-06-15 14:34", read: true },
      { id: 4, sender: "patient", text: "Around 6-7. They're particularly bad in the morning.", timestamp: "2023-06-15 14:36", read: true },
    ],
    2: [
      { id: 5, sender: "doctor", text: "Have you taken your prescribed medications?", timestamp: "2023-06-14 10:15", read: true },
      { id: 6, sender: "patient", text: "Yes, but I'm still experiencing some side effects.", timestamp: "2023-06-14 10:20", read: true },
      { id: 7, sender: "doctor", text: "What kind of side effects are you experiencing?", timestamp: "2023-06-14 10:22", read: true },
      { id: 8, sender: "patient", text: "I've been feeling nauseous after taking the evening dose.", timestamp: "2023-06-14 10:25", read: true },
    ],
    3: [
      { id: 9, sender: "pharmacy", text: "Your prescription is ready for pickup.", timestamp: "2023-06-13 16:45", read: true },
      { id: 10, sender: "patient", text: "Thank you! I'll pick it up tomorrow.", timestamp: "2023-06-13 17:00", read: true },
      { id: 11, sender: "pharmacy", text: "Great! We're open from 9AM to 8PM.", timestamp: "2023-06-13 17:02", read: true },
      { id: 12, sender: "patient", text: "Is there a way to get it delivered? I'm not feeling well enough to come in person.", timestamp: "2023-06-13 17:05", read: true },
    ],
    4: [
      { id: 13, sender: "pharmacy", text: "Hello! Do you need a refill for your prescription?", timestamp: "2023-06-18 09:10", read: false },
    ],
  },
  doctor: {
    5: [
      { id: 14, sender: "patient", text: "Hello Dr. Singh, I need to reschedule my appointment for tomorrow.", timestamp: "2023-06-16 09:30", read: true },
      { id: 15, sender: "doctor", text: "Good morning. That's fine. What time works for you?", timestamp: "2023-06-16 09:35", read: true },
      { id: 16, sender: "patient", text: "Would 4PM be possible?", timestamp: "2023-06-16 09:37", read: true },
      { id: 17, sender: "doctor", text: "Yes, 4PM works. I've updated your appointment in the system.", timestamp: "2023-06-16 09:40", read: true },
    ],
    6: [
      { id: 18, sender: "patient", text: "Doctor, my fever hasn't gone down despite taking the medicine.", timestamp: "2023-06-17 20:15", read: false },
    ],
    7: [
      { id: 19, sender: "doctor", text: "Hi Dr. Dubey, could you take a look at this patient case?", timestamp: "2023-06-18 11:20", read: false },
    ],
    8: [
      { id: 20, sender: "pharmacy", text: "We're out of stock for Metformin. Can you suggest an alternative?", timestamp: "2023-06-17 14:45", read: true },
      { id: 21, sender: "doctor", text: "You can substitute with Glucophage XR 500mg. Same dosage.", timestamp: "2023-06-17 15:10", read: true },
    ],
  },
  pharmacy: {
    9: [
      { id: 22, sender: "doctor", text: "Hello, I need to check if you have Azithromycin in stock.", timestamp: "2023-06-12 11:20", read: true },
      { id: 23, sender: "pharmacy", text: "Yes, we have it available. What strength do you need?", timestamp: "2023-06-12 11:25", read: true },
      { id: 24, sender: "doctor", text: "500mg tablets. I'm planning to prescribe it to a patient today.", timestamp: "2023-06-12 11:27", read: true },
      { id: 25, sender: "pharmacy", text: "We have the 500mg tablets in stock. Your patient can come anytime to collect them.", timestamp: "2023-06-12 11:30", read: true },
    ],
    10: [
      { id: 26, sender: "patient", text: "Do you have any blood glucose testing kits available?", timestamp: "2023-06-14 17:25", read: false },
    ],
    11: [
      { id: 27, sender: "patient", text: "Can you check if my prescription is ready?", timestamp: "2023-06-17 13:15", read: true },
      { id: 28, sender: "pharmacy", text: "Yes, it's ready for pickup. We close at 8PM today.", timestamp: "2023-06-17 13:20", read: true },
    ],
  },
};

// User profiles for mock login
const userProfiles = {
  patient: {
    id: "p1",
    name: "Anisha Gupta",
    avatar: "/assets/patient-avatar.jpg",
    email: "anisha@example.com",
    age: 28,
    gender: "Female",
    bloodGroup: "B+",
    medicalHistory: ["Asthma", "Allergies"],
    contactNumber: "9876543210",
    address: "123 IIT Campus, Jodhpur",
    emergencyContact: "9876543211 (Rahul Gupta - Husband)",
    recentAppointments: [
      { date: "2023-10-15", doctor: "Dr. Neha Sharma", reason: "Regular checkup" },
      { date: "2023-09-05", doctor: "Dr. Shikha Chibber", reason: "Migraine" }
    ]
  },
  doctor: {
    id: "d1",
    name: "Dr. Mohan Singh",
    avatar: "/assets/doctor-avatar.jpg",
    email: "dr.mohan@medihelp.com",
    specialization: "Cardiologist",
    qualifications: ["MBBS", "MD Cardiology", "FICC"],
    experience: "12 years",
    workingHours: "Mon-Fri: 9AM-5PM",
    hospitalAffiliation: "IIT Jodhpur Medical Center",
    contactNumber: "9876543212",
    languages: ["English", "Hindi", "Punjabi"],
    patientsSeen: 4500
  },
  pharmacy: {
    id: "ph1",
    name: "Campus Pharmacy",
    avatar: "/assets/pharmacy-avatar.jpg",
    email: "campus.pharmacy@medihelp.com",
    licenseNumber: "PH-12345-JDH",
    operatingHours: "Mon-Sat: 8AM-10PM, Sun: 9AM-7PM",
    address: "Near IIT Jodhpur Main Gate",
    contactNumber: "9876543213",
    pharmacistOnDuty: "Rajesh Sharma",
    servicesOffered: ["Prescription Filling", "OTC Medicines", "Medical Equipment", "Home Delivery"],
    establishedYear: 2015
  }
};

// Predefined reply texts for different user types
const replyTexts = {
  doctor: [
    "I'll check your records and get back to you.",
    "Have you tried taking the medication I prescribed earlier?",
    "Would you like to schedule an appointment to discuss this further?",
    "Thank you for the update. Keep monitoring your symptoms.",
    "I recommend you get some rest and stay hydrated.",
    "How long have you been experiencing these symptoms?",
    "Please let me know if there's any change in your condition.",
    "I'll prescribe something stronger if this doesn't work."
  ],
  patient: [
    "Thank you for your advice, doctor.",
    "When should I take this medication?",
    "Is there anything else I should be aware of?",
    "I'll make sure to follow your instructions.",
    "Should I come in for a follow-up appointment?",
    "The symptoms have improved since yesterday.",
    "I've been taking the medicine as prescribed.",
    "How long should I continue with this treatment?"
  ],
  pharmacy: [
    "Your prescription will be ready in about 30 minutes.",
    "We have the medication in stock.",
    "Would you like us to deliver the medication?",
    "Please bring your insurance card when you come to pick up your prescription.",
    "The medication costs ₹750. Will you be paying by cash or card?",
    "We're open until 8PM today.",
    "This medication should be taken with food.",
    "We can set up automatic refills for your prescriptions if you'd like."
  ]
};

// Export the chat service
export const chatService = {
  // Get all conversations for a user type
  getConversationsForUser: (userType) => {
    return conversationsStore[userType] || {};
  },
  
  // Get messages for a specific contact
  getMessagesForContact: (userType, contactId) => {
    if (conversationsStore[userType] && conversationsStore[userType][contactId]) {
      return conversationsStore[userType][contactId];
    }
    return [];
  },
  
  // Send a message
  sendMessage: (userType, contactId, message, updatedConversations) => {
    // Update the local store
    if (!conversationsStore[userType]) {
      conversationsStore[userType] = {};
    }
    conversationsStore[userType][contactId] = updatedConversations[contactId];
    
    // In a real app, we would send this to a backend API
    console.log(`Message sent from ${userType} to contact ${contactId}:`, message);
    
    return true;
  },
  
  // Receive a message
  receiveMessage: (userType, contactId, message, updatedConversations) => {
    // Update the local store
    if (!conversationsStore[userType]) {
      conversationsStore[userType] = {};
    }
    conversationsStore[userType][contactId] = updatedConversations[contactId];
    
    // In a real app, we would receive this via WebSockets or polling
    console.log(`Message received by ${userType} from contact ${contactId}:`, message);
    
    return true;
  },
  
  // Update conversations (e.g., mark as read)
  updateConversations: (updatedConversations) => {
    // In a real app, we would send this to a backend API
    console.log("Conversations updated:", updatedConversations);
    
    return true;
  },
  
  // Login a user
  loginUser: (userType, username, password) => {
    // In a real app, we would authenticate against a backend
    // For demo, always return the userProfile
    return userProfiles[userType];
  },
  
  // Get reply texts for a given user type
  getReplyTexts: (userType) => {
    return replyTexts[userType] || replyTexts.patient;
  }
};
