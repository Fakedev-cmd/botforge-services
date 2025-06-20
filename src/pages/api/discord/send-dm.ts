// pages/api/discord/send-dm.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, message } = req.body;

  try {
    const resp = await fetch('http://localhost:5001/send-dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Failed to send message');

    res.status(200).json({ success: true, userId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
