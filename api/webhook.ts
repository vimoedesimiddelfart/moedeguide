import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { hentAktoerData, Aktoer } from '../lib/aktoerdata';
import { sendEmail } from '../lib/email';

const client = new Anthropic();

// Mapper Tally felter til vores format
interface KundeForespørgsel {
  email: string;
  kontaktperson: string;
  virksomhed: string;
  antal_deltagere: number;
  dato_fra: string;
  dato_til: string;
  antal_dage: number;
  formaal: string;         // konference, seminar, workshop, teambuilding, retreat
  natur_niveau: string;    // lidt, noget, meget
  budget: string;          // budget, mellem, premium
  overnatning: boolean;
  forplejning: boolean;
  teambuilding: boolean;
  oensker: string;         // fritekst
}

function parseTallyWebhook(body: any): KundeForespørgsel {
  // Tally sender data som { data: { fields: [...] } }
  // Hvert felt har: { key, label, value, type }
  const fields = body?.data?.fields || [];

  function getField(label: string): string {
    const field = fields.find((f: any) =>
      f.label?.toLowerCase().includes(label.toLowerCase())
    );
    return field?.value?.toString() || '';
  }

  function getChoiceField(label: string): string {
    const field = fields.find((f: any) =>
      f.label?.toLowerCase().includes(label.toLowerCase())
    );
    if (field?.options) {
      const selected = field.options.find((o: any) => o.id === field.value);
      return selected?.text || field.value?.toString() || '';
    }
    if (Array.isArray(field?.value)) {
      return field.value.join(', ');
    }
    return field?.value?.toString() || '';
  }

  return {
    email: getField('email') || getField('e-mail') || getField('mail'),
    kontaktperson: getField('navn') || getField('kontakt'),
    virksomhed: getField('virksomhed') || getField('firma') || getField('organisation'),
    antal_deltagere: parseInt(getField('antal') || getField('deltager')) || 20,
    dato_fra: getField('fra') || getField('start') || getField('dato'),
    dato_til: getField('til') || getField('slut'),
    antal_dage: parseInt(getField('dage') || getField('varighed')) || 1,
    formaal: getChoiceField('formål') || getChoiceField('type') || 'konference',
    natur_niveau: getChoiceField('natur') || 'noget',
    budget: getChoiceField('budget') || getChoiceField('pris') || 'mellem',
    overnatning: getField('overnatning').toLowerCase().includes('ja') || getField('overnatning') === 'true',
    forplejning: getField('forplejning').toLowerCase().includes('ja') || getField('forplejning') === 'true',
    teambuilding: getField('teambuilding').toLowerCase().includes('ja') || getField('teambuilding') === 'true',
    oensker: getField('ønsker') || getField('kommentar') || getField('besked') || '',
  };
}

function formatAktoerData(aktoerer: Aktoer[]): string {
  return aktoerer.map(a => `
**${a.navn}** (${a.type})
- Kapacitet: ${a.kapacitet_min}-${a.kapacitet_max} personer
- Faciliteter: ${a.faciliteter.join(', ')}
- Naturpakker: ${a.naturpakker.join(', ')}
- Udsigt: ${a.udsigt}
- Prisniveau: ${a.prisniveau}
- Beskrivelse: ${a.beskrivelse}
- Kontakt: ${a.kontakt}
`).join('\n');
}

async function genererForslag(kunde: KundeForespørgsel, aktoerer: Aktoer[]): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Du er MødeGuide for VisitMiddelfart – en professionel og venlig rådgiver der hjælper virksomheder med at planlægge møder og konferencer i Middelfart.

En kunde har udfyldt vores formular. Lav 3 forskellige forslag til deres møde/konference.

## KUNDENS BEHOV:
- Kontaktperson: ${kunde.kontaktperson}
- Virksomhed: ${kunde.virksomhed}
- Antal deltagere: ${kunde.antal_deltagere}
- Dato: ${kunde.dato_fra} ${kunde.dato_til ? '– ' + kunde.dato_til : ''}
- Varighed: ${kunde.antal_dage} dag(e)
- Formål: ${kunde.formaal}
- Natur-niveau: ${kunde.natur_niveau}
- Budget: ${kunde.budget}
- Overnatning: ${kunde.overnatning ? 'Ja' : 'Nej'}
- Forplejning: ${kunde.forplejning ? 'Ja' : 'Nej'}
- Teambuilding: ${kunde.teambuilding ? 'Ja' : 'Nej'}
- Særlige ønsker: ${kunde.oensker || 'Ingen'}

## TILGÆNGELIGE AKTØRER OG TILBUD:
${formatAktoerData(aktoerer)}

## REGLER:
- Lav præcis 3 forslag med stigende prisniveau/ambitionsniveau
- Hvert forslag skal have: overskrift, kort beskrivelse, detaljeret program/dagplan, inkluderede aktører med kontaktinfo, estimeret prisniveau
- Tilpas forslagene til kundens natur-niveau ønske
- Matchende kapacitet (kundens antal skal passe inden for aktørens min-max)
- Vær specifik med aktørnavne og deres tilbud – brug kun aktører fra listen
- Skriv på dansk, professionelt men varmt sprog
- Fremhæv det unikke ved Middelfart (Lillebælt, marsvin, natur, bro)

Svar i HTML-format klar til email. Brug denne struktur:
<h2>Forslag 1: [overskrift]</h2>
<p>[kort beskrivelse]</p>
<h3>Program</h3>
[program detaljer]
<h3>Inkluderede aktører</h3>
[aktør info]
<h3>Estimeret pris</h3>
[prisniveau]
<hr>
[gentag for forslag 2 og 3]`
    }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

function buildEmailHtml(kunde: KundeForespørgsel, forslag: string): string {
  return `
<!DOCTYPE html>
<html lang="da">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #1c1917; line-height: 1.6;">
  <div style="background: #2d8a7e; color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">MødeGuide Middelfart</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Jeres skræddersyede mødeforslag</p>
  </div>

  <div style="background: #fafaf9; padding: 30px; border: 1px solid #e7e5e4; border-top: none;">
    <p>Kære ${kunde.kontaktperson},</p>
    <p>Tak for jeres interesse i at holde ${kunde.formaal} i Middelfart! Vi har sammensat 3 forslag baseret på jeres ønsker om ${kunde.antal_deltagere} deltagere${kunde.overnatning ? ' med overnatning' : ''}.</p>

    <hr style="border: none; border-top: 2px solid #2d8a7e; margin: 30px 0;">

    ${forslag}

    <hr style="border: none; border-top: 2px solid #e7e5e4; margin: 30px 0;">

    <p>Vi håber ét af forslagene fanger jeres interesse! I er meget velkomne til at kontakte os for at tilpasse eller kombinere elementer fra de forskellige forslag.</p>

    <p>
      Med venlig hilsen<br>
      <strong>VisitMiddelfart – MødeGuide</strong><br>
      <a href="https://www.visitmiddelfart.dk" style="color: #2d8a7e;">www.visitmiddelfart.dk</a>
    </p>
  </div>

  <div style="background: #292524; color: #a8a29e; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 13px;">
    <p style="margin: 0;">Dette er et automatisk genereret forslag baseret på jeres forespørgsel.</p>
    <p style="margin: 4px 0 0;">Kontakt os for at tilpasse forslagene yderligere.</p>
  </div>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    // 1. Parse Tally webhook
    const kunde = parseTallyWebhook(req.body);

    if (!kunde.email) {
      return res.status(400).json({ error: 'Ingen email fundet i forespørgslen' });
    }

    // 2. Hent aktør-data
    const aktoerer = await hentAktoerData();

    // Filtrer aktører der matcher kapacitet
    const relevante = aktoerer.filter(a =>
      kunde.antal_deltagere >= a.kapacitet_min &&
      kunde.antal_deltagere <= a.kapacitet_max
    );

    // 3. Generér 3 forslag med Claude
    const forslag = await genererForslag(kunde, relevante.length > 0 ? relevante : aktoerer);

    // 4. Send email
    const html = buildEmailHtml(kunde, forslag);
    await sendEmail(
      kunde.email,
      `Jeres mødeforslag til ${kunde.formaal} i Middelfart – ${kunde.antal_deltagere} deltagere`,
      html
    );

    // 5. Log til intern email (BCC)
    if (process.env.INTERN_EMAIL) {
      await sendEmail(
        process.env.INTERN_EMAIL,
        `[MødeGuide] Ny forespørgsel: ${kunde.virksomhed} – ${kunde.antal_deltagere} pers.`,
        `<h2>Forespørgsel fra ${kunde.kontaktperson} (${kunde.virksomhed})</h2>
        <pre>${JSON.stringify(kunde, null, 2)}</pre>
        <hr>
        ${html}`
      );
    }

    res.status(200).json({
      ok: true,
      message: `Forslag sendt til ${kunde.email}`,
      kunde: { email: kunde.email, virksomhed: kunde.virksomhed, antal: kunde.antal_deltagere },
    });

  } catch (e: any) {
    console.error('webhook error:', e);
    res.status(500).json({ error: e.message });
  }
}
