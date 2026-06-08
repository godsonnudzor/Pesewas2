import { supabase } from './lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('account_types')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Health check failed:', error);
      return res.status(503).json({ status: 'error', message: 'Supabase connection failed', error: error.message });
    }

    return res.status(200).json({ status: 'ok', message: 'Server and Supabase are working', details: { records: data?.length ?? 0 } });
  } catch (error) {
    console.error('Health check exception:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}
