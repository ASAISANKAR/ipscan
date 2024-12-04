import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saisankar:system@cluster0.gv6neug.mongodb.net/ipcap';

// Define the Schema for UserInfo
const userInfoSchema = new mongoose.Schema({
  ipAddress: String,
  systemInfo: Object,
  websiteLink: String,
  timestamp: { type: Date, default: Date.now },
});

const UserInfo = mongoose.model('UserInfo', userInfoSchema);

// MongoDB connection logic
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// API handler function for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Storing user information logic
    try {
      const { ipAddress, systemInfo } = req.body;

      // Capture the website link from the Referer or Origin header
      const referer = req.headers.referer || req.headers.origin;
      const websiteLink = referer || 'https://your-default-site-url.com';  

      // Create a new user entry in MongoDB
      const newUser = new UserInfo({ ipAddress, systemInfo, websiteLink });
      await newUser.save();

      res.status(200).json({ message: 'User info and website link stored successfully!' });
    } catch (error) {
      console.error('Error storing user info:', error);
      res.status(500).json({ message: 'Error storing user info' });
    }
  } else if (req.method === 'GET') {
    // Hello endpoint logic
    const { name = 'World' } = req.query;
    res.status(200).json({ message: `Hello ${name}!` });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
