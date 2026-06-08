import { supabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!id) {
    return res.status(400).json({ message: 'Fiscal year id is required' });
  }

  try {
    const { data, error } = await supabase
      .from('fiscal_years')
      .update({
        is_closed: true,
        closed_at: new Date().toISOString(),
        closed_by: 'system',
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Close fiscal year error:', error);
      return res.status(500).json({ message: error.message || 'Unable to close fiscal year.' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Close fiscal year exception:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
