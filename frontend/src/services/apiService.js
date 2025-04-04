import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // adjust if your backend runs elsewhere

export const sendSOSLocation = async (location) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sos`, location);
    return response.data;
  } catch (error) {
    console.error("Failed to send SOS:", error);
    throw error.response?.data || { message: "Unknown error occurred." };
  }
};

/*
🧠 What This Does:
Uses axios to send a POST request to /api/sos on your backend

Sends the location object { latitude, longitude }

Handles success and errors gracefully
*/