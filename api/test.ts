import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simulerer en Tally webhook med testdata
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST /api/test med { email: "din@email.dk" }' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Angiv email i body: { "email": "din@email.dk" }' });
  }

  // Byg Tally-lignende payload
  const tallyPayload = {
    data: {
      fields: [
        { label: 'Email', value: email },
        { label: 'Navn', value: 'Test Testersen' },
        { label: 'Virksomhed', value: 'Test A/S' },
        { label: 'Antal deltagere', value: '35' },
        { label: 'Dato fra', value: '2026-06-15' },
        { label: 'Dato til', value: '2026-06-16' },
        { label: 'Antal dage', value: '2' },
        { label: 'Formål', value: 'konference' },
        { label: 'Natur-niveau', value: 'meget' },
        { label: 'Budget', value: 'mellem' },
        { label: 'Overnatning', value: 'Ja' },
        { label: 'Forplejning', value: 'Ja' },
        { label: 'Teambuilding', value: 'Ja' },
        { label: 'Særlige ønsker', value: 'Vi vil gerne have et element med marsvin/hvalsafari og noget udeaktivitet. Gerne lokal mad.' },
      ]
    }
  };

  // Forward til webhook endpoint
  const baseUrl = `https://${req.headers.host}`;
  const webhookRes = await fetch(`${baseUrl}/api/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tallyPayload),
  });

  const result = await webhookRes.json();
  res.status(webhookRes.status).json({ test: true, ...result });
}
