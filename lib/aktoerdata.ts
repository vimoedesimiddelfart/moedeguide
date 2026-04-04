// Mock-data – erstattes senere med Google Sheets integration
// Strukturen afspejler hvad hoteller/aktører svarer i Tally-survey

export interface Aktoer {
  navn: string;
  type: 'hotel' | 'konferencecenter' | 'aktivitet' | 'restaurant' | 'teambuilding';
  kapacitet_min: number;
  kapacitet_max: number;
  faciliteter: string[];
  naturpakker: string[];
  udsigt: string;
  beliggenhed: string;
  prisniveau: 'budget' | 'mellem' | 'premium';
  beskrivelse: string;
  kontakt: string;
  hjemmeside: string;
}

export const aktoerer: Aktoer[] = [
  {
    navn: 'Hindsgavl Slot',
    type: 'konferencecenter',
    kapacitet_min: 10,
    kapacitet_max: 200,
    faciliteter: ['mødelokaler', 'overnatning', 'restaurant', 'parkering', 'wifi', 'AV-udstyr', 'teambuilding-faciliteter'],
    naturpakker: ['slotspark', 'naturvandring', 'havkajak', 'mountainbike'],
    udsigt: 'Lillebælt og slotspark',
    beliggenhed: 'Hindsgavl Allé 7, 5500 Middelfart',
    prisLevel: 'premium' as any,
    prisNiveau: 'premium',
    beskrivelse: 'Historisk slot med moderne konferencefaciliteter. Beliggende i naturskønne omgivelser ved Lillebælt med egen slotspark. Perfekt til ekslusive konferencer og retreats.',
    kontakt: 'konference@hindsgavl.dk',
    hjemmeside: 'https://hindsgavl.dk',
  },
  {
    navn: 'Comwell Middelfart',
    type: 'hotel',
    kapacitet_min: 5,
    kapacitet_max: 300,
    faciliteter: ['mødelokaler', 'overnatning', 'restaurant', 'spa', 'fitness', 'parkering', 'wifi', 'AV-udstyr'],
    naturpakker: ['strandvandring', 'løberuter', 'cykelture'],
    udsigt: 'Lillebælt og Den Gamle Lillebæltsbro',
    beliggenhed: 'Karensmindevej 3, 5500 Middelfart',
    prisLevel: 'mellem' as any,
    prisNiveau: 'mellem',
    beskrivelse: 'Moderne hotel og konferencecenter med udsigt over Lillebælt. Spa og wellness-faciliteter. Tæt på motorvej og tog.',
    kontakt: 'middelfart@comwell.dk',
    hjemmeside: 'https://comwell.dk/middelfart',
  },
  {
    navn: 'Sixtus Sinatur Hotel & Konference',
    type: 'konferencecenter',
    kapacitet_min: 8,
    kapacitet_max: 150,
    faciliteter: ['mødelokaler', 'overnatning', 'restaurant', 'parkering', 'wifi', 'AV-udstyr', 'haven'],
    naturpakker: ['naturvandring', 'skov', 'meditation i naturen'],
    udsigt: 'Have og skov',
    beliggenhed: 'Skovvej 30, 5500 Middelfart',
    prisLevel: 'mellem' as any,
    prisNiveau: 'mellem',
    beskrivelse: 'Charmerende konferencested omgivet af natur og skov. Fokus på bæredygtighed og grønne møder. Ideel til fordybelse og kreative workshops.',
    kontakt: 'sixtus@sinatur.dk',
    hjemmeside: 'https://sinatur.dk/sixtus',
  },
  {
    navn: 'Lillebælt Naturguide',
    type: 'aktivitet',
    kapacitet_min: 5,
    kapacitet_max: 40,
    faciliteter: ['udendørs aktiviteter', 'naturformidling'],
    naturpakker: ['hvalsafari', 'havkajak', 'snorkling', 'strandvandring', 'fuglekig'],
    udsigt: 'Lillebælt',
    beliggenhed: 'Middelfart Havn',
    prisLevel: 'mellem' as any,
    prisNiveau: 'mellem',
    beskrivelse: 'Guidede naturoplevelser i og omkring Lillebælt. Hvalsafari med garanti for marsvin. Havkajak, snorkling og strandvandring.',
    kontakt: 'info@lillebaeltnaturguide.dk',
    hjemmeside: 'https://lillebaeltnaturguide.dk',
  },
  {
    navn: 'TeamForce',
    type: 'teambuilding',
    kapacitet_min: 10,
    kapacitet_max: 100,
    faciliteter: ['teambuilding', 'udendørs aktiviteter'],
    naturpakker: ['GPS-løb i skoven', 'raftbuilding', 'orienteringsløb', 'survival-tur'],
    udsigt: 'Varierer efter lokation',
    beliggenhed: 'Middelfart og omegn',
    prisLevel: 'mellem' as any,
    prisNiveau: 'mellem',
    beskrivelse: 'Professionel teambuilding med fokus på natur og samarbejde. Skræddersyede forløb til virksomheder.',
    kontakt: 'info@teamforce.dk',
    hjemmeside: 'https://teamforce.dk',
  },
  {
    navn: 'Restaurant Bryggen',
    type: 'restaurant',
    kapacitet_min: 10,
    kapacitet_max: 60,
    faciliteter: ['selskabslokale', 'terrasse', 'parkering'],
    naturpakker: ['havnefront'],
    udsigt: 'Middelfart Havn og Lillebælt',
    beliggenhed: 'Havnegade 12, 5500 Middelfart',
    prisLevel: 'mellem' as any,
    prisNiveau: 'mellem',
    beskrivelse: 'Lokal restaurant med fokus på friske råvarer og fisk fra Lillebælt. Perfekt til konferencemiddage og netværksarrangementer.',
    kontakt: 'info@restaurantbryggen.dk',
    hjemmeside: 'https://restaurantbryggen.dk',
  },
];

// Denne funktion erstattes senere med Google Sheets fetch
export async function hentAktoerData(): Promise<Aktoer[]> {
  // TODO: Erstat med Google Sheets API kald
  return aktoerer;
}
