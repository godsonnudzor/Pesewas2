import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabaseClient.js';

const jwtSecret = process.env.JWT_SECRET || 'secret_key_jwt';

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

    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ loginStatus: false, Error: 'Wrong Email or Password' });
    }

    const passwordMatch = await bcrypt.compare(password, data.password);
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
