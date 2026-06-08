import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch fiscal years error:', error);
        return res.status(500).json({ message: 'Unable to fetch fiscal years.' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Fetch fiscal years exception:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, start_date, end_date } = req.body;

      if (!name || !start_date || !end_date) {
        return res.status(400).json({ message: 'Name, start date, and end date are required.' });
      }

      const { data, error } = await supabase
        .from('fiscal_years')
        .insert([
          {
            name,
            start_date,
            end_date,
            is_closed: false,
          },
        ])
        .select('*')
        .single();

      if (error) {
        console.error('Create fiscal year error:', error);
        return res.status(500).json({ message: error.message || 'Unable to create fiscal year.' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Create fiscal year exception:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: 'Method not allowed' });
}
