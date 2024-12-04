import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');  // Allows any origin to access the resource (You can replace '*' with 'http://localhost:3000' for more restricted access)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  // Allow GET, POST, and OPTIONS methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allow Content-Type header

  // Handle preflight request (OPTIONS request)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();  // Respond with a 200 status for OPTIONS (preflight) requests
  }

  const { name = 'World' } = req.query;
  return res.json({
    message: `Hello ${name}!`,
  });
}
