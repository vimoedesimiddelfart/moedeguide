import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    has_anthropic_key: !!process.env.ANTHROPIC_API_KEY,
    key_length: process.env.ANTHROPIC_API_KEY?.length || 0,
    key_prefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'MISSING',
    has_gmail: !!process.env.GMAIL_USER,
    gmail_user: process.env.GMAIL_USER || 'MISSING',
    env_keys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC') || k.includes('GMAIL') || k.includes('INTERN')),
  });
}
