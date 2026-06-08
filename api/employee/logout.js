export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  return res.status(200).json({ status: true });
}
