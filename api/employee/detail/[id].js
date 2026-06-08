import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const {
    query: { id },
  } = req;

  if (!id) {
    return res.status(400).json({ status: false, message: 'Employee id is required' });
  }

  try {
    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ status: false, message: 'Employee not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Employee detail error:', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}
