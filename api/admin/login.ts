import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const configuredPassword = process.env.MDA_ADMIN_PASSWORD;
  if (!configuredPassword) {
    return res.status(503).json({ ok: false, error: 'Administrator sign-in is not configured' });
  }

  const submittedPassword = req.body?.password;
  if (typeof submittedPassword !== 'string') {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  const expected = Buffer.from(configuredPassword, 'utf8');
  const supplied = Buffer.from(submittedPassword, 'utf8');
  const matches = expected.length === supplied.length && timingSafeEqual(expected, supplied);

  if (!matches) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  return res.status(200).json({ ok: true });
}
