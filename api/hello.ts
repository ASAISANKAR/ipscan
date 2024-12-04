import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose'; // Mongoose for MongoDB interaction

const MONGODB_URI = 'mongodb+srv://saisankar:system@cluster0.gv6neug.mongodb.net/ipcap';

// MongoDB schema and model
const userInfoSchema = new mongoose.Schema({
  ipAddress: String,
  systemInfo: Object,
  websiteLink: String,
  timestamp: { type: Date, default: Date.now },
});

const UserInfo = mongoose.model('UserInfo', userInfoSchema);

// MongoDB connection function
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');  // Allows all origins (for development, use a specific origin like 'http://localhost:3000' instead of '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow Content-Type header

  // Handle OPTIONS request for preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Respond with a 200 status for preflight (OPTIONS) requests
  }

  // Handle POST request
  if (req.method === 'POST') {
    try {
      // Extract IP and system info from the request body
      const { ipAddress, systemInfo } = req.body;

      // Capture the website link from the referer or origin header
      const referer = req.headers.referer || req.headers.origin;
      const websiteLink = referer || 'https://your-default-site-url.com';  

      // Connect to the MongoDB database
      await connectToDatabase();

      // Save user info to MongoDB
      const newUser = new UserInfo({
        ipAddress,
        systemInfo,
        websiteLink,
      });
      await newUser.save();

      // Return a success message
      return res.status(200).json({
        message: 'User info stored successfully!',
      });
    } catch (error) {
      console.error('Error storing user info:', error);
      return res.status(500).json({ message: 'Error storing user info' });
    }
  }

  // Respond with 405 for unsupported methods
  return res.status(405).json({ message: 'Method Not Allowed' });
}
