import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'secret_key_jwt';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Missing auth token' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    return res.status(200).json({ success: true, user: decoded });
  });
}
