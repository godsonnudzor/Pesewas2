import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabaseClient.js';

const jwtSecret = process.env.JWT_SECRET || 'secret_key_jwt';

const findUserByEmail = async (email) => {
  const { data: adminUser, error: adminError } = await supabase
    .from('admin')
    .select('*')
    .eq('email', email)
    .single();

  if (!adminError && adminUser) {
    return { user: adminUser, role: 'admin' };
  }

  const { data: employeeUser, error: employeeError } = await supabase
    .from('employee')
    .select('*')
    .eq('email', email)
    .single();

  if (!employeeError && employeeUser) {
    return { user: employeeUser, role: 'employee' };
  }

  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const found = await findUserByEmail(email);
    if (!found) {
      return res.status(401).json({ success: false, error: 'Wrong Email or Password' });
    }

    const passwordMatch = await bcrypt.compare(password, found.user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Wrong Email or Password' });
    }

    const token = jwt.sign(
      {
        id: found.user.id,
        email: found.user.email,
        role: found.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: found.user.id,
        email: found.user.email,
        role: found.role,
      },
    });
  } catch (error) {
    console.error('Auth login error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
