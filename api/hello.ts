import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';  // Mongoose for MongoDB interaction

// MongoDB connection string (replace with your actual MongoDB URI)
const MONGODB_URI = 'mongodb+srv://saisankar:system@cluster0.gv6neug.mongodb.net/ipcap';

// Define the Schema for storing user info
const userInfoSchema = new mongoose.Schema({
  ipAddress: String,
  systemInfo: Object,
  websiteLink: String,  // Field to store the website link
  timestamp: { type: Date, default: Date.now },
});

// Create a Mongoose model based on the schema
const UserInfo = mongoose.model('UserInfo', userInfoSchema);

// Function to connect to MongoDB (called before saving data)
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    // If already connected, no need to connect again
    return;
  }

  // Connect to MongoDB
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');  // Allows any origin to access the resource
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  // Allow GET, POST, and OPTIONS methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow Content-Type header

  // Handle preflight request (OPTIONS request)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();  // Respond with a 200 status for OPTIONS (preflight) requests
  }

  // Ensure the request is a POST request
  if (req.method === 'POST') {
    try {
      // Get the IP address and system information from the request body
      const { ipAddress, systemInfo } = req.body;

      // Capture the website link from the Referer or Origin header
      const referer = req.headers.referer || req.headers.origin;
      const websiteLink = referer || 'https://your-default-site-url.com';  

      // Connect to the database
      await connectToDatabase();

      // Create a new user entry
      const newUser = new UserInfo({
        ipAddress,
        systemInfo,
        websiteLink,
      });

      // Save the user info to MongoDB
      await newUser.save();

      // Respond with success message
      return res.status(200).json({
        message: 'User info stored successfully!',
      });
    } catch (error) {
      console.error('Error storing user info:', error);
      return res.status(500).json({ message: 'Error storing user info' });
    }
  }

  // Default response for GET or unsupported methods
  return res.status(405).json({ message: 'Method Not Allowed' });
}
