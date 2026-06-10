import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabaseClient.js';

const jwtSecret = process.env.JWT_SECRET || 'secret_key_jwt';

const isBcryptHash = (value) =>
  typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
const verifyPassword = async (plainPassword, storedPassword) => {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }
  return plainPassword === storedPassword;
};

const passwordFieldCandidates = [
  'password',
  'password_hash',
  'hashed_password',
  'pass',
  'pwd',
  'user_password',
  'user_pass',
];

const getStoredPassword = (user) => {
  if (!user || typeof user !== 'object') return null;
  for (const key of passwordFieldCandidates) {
    if (typeof user[key] === 'string') {
      return user[key];
    }
  }
  const fallbackKey = Object.keys(user).find((key) =>
    /(password|pass|pwd|hash|secret)/i.test(key) && typeof user[key] === 'string',
  );
  return fallbackKey ? user[fallbackKey] : null;
};

export default async function handler(req, res) {
  if (!supabase) {
    return res.status(500).json({ loginStatus: false, Error: 'Supabase is not configured' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ loginStatus: false, Error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ loginStatus: false, Error: 'Email and password are required' });
    }

    const employeeTables = ['employees', 'employee'];
    let data = null;
    let error = null;

    for (const table of employeeTables) {
      const response = await supabase
        .from(table)
        .select('*')
        .eq('email', email)
        .single();

      if (!response.error && response.data) {
        data = response.data;
        break;
      }
      error = response.error || error;
    }

    if (error || !data) {
      return res.status(401).json({ loginStatus: false, Error: 'Wrong Email or Password' });
    }

    const storedPassword = getStoredPassword(data);
    if (!storedPassword) {
      console.warn('Employee login: no password field found for user', {
        userId: data.id,
        userKeys: Object.keys(data),
      });
      return res.status(401).json({ loginStatus: false, Error: 'Wrong Email or Password' });
    }

    const passwordMatch = await verifyPassword(password, storedPassword);
    if (!passwordMatch) {
      return res.status(401).json({ loginStatus: false, Error: 'Wrong Email or Password' });
    }

    const token = jwt.sign(
      { role: 'employee', email: data.email, id: data.id },
      jwtSecret,
      { expiresIn: '2d' }
    );

    return res.status(200).json({
      loginStatus: true,
      id: data.id,
      token,
      user: {
        id: data.id,
        email: data.email,
        role: 'employee',
      },
    });
  } catch (error) {
    console.error('Employee login error:', error);
    return res.status(500).json({ loginStatus: false, Error: 'Internal Server Error' });
  }
}
