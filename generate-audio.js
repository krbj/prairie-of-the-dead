/*
 * DØDENS PRÆRIE — genererer stemmer og musikk med ElevenLabs
 *
 * Bruk:
 *   1. Hent en API-nøkkel på https://elevenlabs.io (Profil -> API Keys)
 *   2. Lagre nøkkelen i fila `elevenlabs-key.txt` her i mappa
 *      (eller sett miljøvariabelen ELEVENLABS_API_KEY)
 *   3. Kjør:  node generate-audio.js
 *
 * Skriptet lager `audio/voice/*.mp3` (alle replikker, norsk tale),
 * `audio/music/*.mp3` (dag/natt/boss) og `audio/manifest.json`.
 * Spillet plukker dem opp automatisk. Filer som alt finnes hoppes over,
 * så det er trygt å kjøre skriptet flere ganger.
 */
const fs = require('fs');
const path = require('path');

const KEYFILE = path.join(__dirname, 'elevenlabs-key.txt');
const KEY = process.env.ELEVENLABS_API_KEY ||
  (fs.existsSync(KEYFILE) ? fs.readFileSync(KEYFILE, 'utf8').trim() : null);
if (!KEY) {
  console.error('Mangler API-nøkkel!');
  console.error('Lagre nøkkelen din i elevenlabs-key.txt, eller sett ELEVENLABS_API_KEY.');
  process.exit(1);
}

// ElevenLabs premade-stemmer — bytt gjerne ut med egne favoritter fra Voice Library
// NB: kun standard premade-stemmer (gratisplanen tillater ikke library-stemmer via API)
const VOICES = {
  john:       'pqHfZKP75CvOlQylNhV4', // Bill  — eldre, barsk veteran (leder)
  sigbjorn:   'onwK4e9ZLuTAKqWW03F9', // Daniel — dyp og alvorlig
  kristoffer: 'iP95p4xoKVk53GoZ742B', // Chris — yngre og energisk
  mio:        'pNInz6obpgDQGcFmaJgB'  // Adam  — rolig helt
};

// MÅ matche spillets tekster nøyaktig (filnavn = taler + hash av tekst)
const LINES = [
  // --- intro-cutscene ---
  ['John', 'Hold it right there, stranger! Hands where I can see them. Are you bitten?'],
  ['Mio', 'The name is Mio. I am not bitten — just dusty and thirsty.'],
  ['Kristoffer', 'Then you are the first living soul we have seen in three weeks.'],
  ['Sigbjørn', 'The virus took the whole town. Neighbors. Friends. Family... All of them.'],
  ['John', 'We three swore a pact: we wipe out this virus — or we die trying.'],
  ['Mio', 'Then I ride no further. I am staying — and fighting beside you.'],
  ['Kristoffer', 'Good. Find weapons and ammo before sundown. An old shotgun is hidden in the saloon.'],
  ['Sigbjørn', 'Because when darkness falls... they come.'],
  // --- seiers-cutscene ---
  ['John', 'The Plague King is dead... It is over. It is actually over.'],
  ['Sigbjørn', 'The virus dies with him. Dust Valley can finally rest in peace.'],
  ['Kristoffer', 'We could never have done it without you, Mio. Never.'],
  ['Mio', 'The pact is fulfilled, brothers. The sun rises over a free prairie.'],
  // --- daggry-replikker ---
  ['Kristoffer', 'Did you find the shotgun in the saloon? Sigbjørn saw dynamite over by the mine.'],
  ['Sigbjørn', 'The miners hid dynamite in the crates out east. Go get it!'],
  ['John', 'Something big is stirring underground. Tonight something worse is coming. Be ready.'],
  ['Sigbjørn', 'The Grave Robber was only the beginning. The virus digs deeper.'],
  ['Kristoffer', 'The hordes grow every night. But so do we.'],
  ['John', 'I hear knives being sharpened in the mine... The Butcher comes tonight.'],
  ['Sigbjørn', 'We are closing in on the source. I can feel it in the air.'],
  ['Kristoffer', 'One more night, and I reckon the Plague King himself will show.'],
  ['John', 'Tonight it ends, brothers. The Plague King himself. For the pact — for Dust Valley!'],
  ['John', 'The endless night goes on... Stand your ground, Mio!'],
  // --- kamprop om natten ---
  ['John', 'For Dust Valley! Not one step back!'],
  ['John', 'Hold the well — they are swarming!'],
  ['John', 'For the pact, brothers! For the pact!'],
  ['Sigbjørn', 'Aim for the head, that stops them fastest!'],
  ['Sigbjørn', 'The virus dies tonight, I swear it!'],
  ['Sigbjørn', 'Behind you, Mio!'],
  ['Kristoffer', 'They are coming from the mine! Lots of them!'],
  ['Kristoffer', 'Save your ammo, Mio — the night is long!'],
  ['Kristoffer', 'Is that all you have, you rotten wretches?!'],
  // --- natt-start / boss ---
  ['Sigbjørn', 'To the well! Here they come!'],
  ['John', 'Feel the ground shaking? Something big is coming tonight!'],
  ['John', 'There he is! Aim for the head!'],
  ['Sigbjørn', 'Holy smoke... he is HUGE!'],
  ['Kristoffer', 'Hold the line, brothers!'],
  ['Kristoffer', 'He is down! Nice work, Mio!'],
  // --- skadet / nede / gjenopplivet ---
  ['John', 'Argh!'],
  ['Sigbjørn', 'They bite hard tonight!'],
  ['Kristoffer', 'I need help over here!'],
  ['John', 'I am down, boys! Help me now!! I am going to die!'],
  ['Sigbjørn', 'I am down, boys! Help me now!! I am going to die!'],
  ['Kristoffer', 'I am down, boys! Help me now!! I am going to die!'],
  ['John', 'Thanks, partner. I owe you one.'],
  ['Sigbjørn', 'Phew... that was close!'],
  ['Kristoffer', 'Back in the fight!'],
  // --- hjelper ein bror opp ---
  ['John', 'Up you get, brother! I have got you!'],
  ['Sigbjørn', 'Up you get, brother! I have got you!'],
  ['Kristoffer', 'Up you get, brother! I have got you!'],
  // --- tak-hendelse ---
  ['John', 'Get up on the roofs!'],
  ['Sigbjørn', 'Get up on the roofs!'],
  ['Kristoffer', 'Get up on the roofs!'],
  // --- siste nivå (gatling) ---
  ['John', 'The gatling guns are ready! Open fire, brothers!'],
  ['John', 'The town is burning, Mio! Shoot those skulls out of the sky!'],
  // --- dødningskallar (natt 10) ---
  ['John', 'Skulls in the sky! Shoot them down before they hit the houses!'],
  ['Sigbjørn', 'More of those flying skulls! Blast them out of the sky, Mio!'],
  ['Kristoffer', 'Skulls incoming from all sides! Watch the sky!'],
  ['John', 'Do not let those skulls through!'],
  ['Sigbjørn', 'They are diving for the roofs! Take them down!'],
  ['Kristoffer', 'Another wave of skulls! Keep shooting!'],
  // --- brann i byen ---
  ['Sigbjørn', 'A house is on fire! The flames spread fast between the buildings — shoot those skulls down!'],
  ['Kristoffer', 'One house is ash already! If seven burn down, the whole town is lost, Mio — all hope gone!'],
  ['Sigbjørn', 'SIX houses gone! One more and Dust Valley is finished! SHOOT THE SKULLS!'],
  // --- atombomba i kyrkja ---
  ['John', 'It is no use, Mio... Arm the atom bomb in the church!'],
  ['Kristoffer', 'Yeah Mio, this is hopeless! Blow the whole damn thing!'],
  ['Sigbjørn', 'MIO!!! NUKE THIS SHIT!!!'],
  // --- retry ---
  ['John', 'Get up, Mio. Dust Valley still needs you!'],
  // --- dagprat (E ved brødrene) ---
  ['John', 'Stay close to the well at night — we cover each other.'],
  ['John', 'The revolver is faithful, but the shotgun stops a whole horde.'],
  ['John', 'The pact includes you too now, Mio.'],
  ['Sigbjørn', 'Dynamite solves most problems out west.'],
  ['Sigbjørn', 'Headshots, Mio. Always headshots.'],
  ['Sigbjørn', 'I saw red eyes inside the mine last night...'],
  ['Kristoffer', 'Beans and whiskey patch you right up.'],
  ['Kristoffer', 'Every third night something bigger comes. Count the nights.'],
  ['Kristoffer', 'Stjerna over there is the last horse in town. Guard her well.']
];

const MUSIC = [
  ['day.mp3', 'Lonesome spaghetti western ambience, slow acoustic guitar picking, distant harmonica, warm desert wind, sparse and calm, instrumental, seamless loop', 90000],
  ['night.mp3', 'Thrilling intense western horror action music, driving galloping percussion, twanging electric guitar riffs, ominous strings building tension, zombie siege under a full moon, dark exciting and relentless, instrumental, seamless loop', 90000],
  ['boss.mp3', 'Epic intense western horror battle music, galloping drums, aggressive guitar and orchestral stabs, relentless and menacing, instrumental, seamless loop', 75000],
  ['final.mp3', 'Apocalyptic western war music, gatling gun rhythm, thundering percussion, distorted guitars, choir stabs, maximum intensity, instrumental, seamless loop', 75000]
];

// samme funksjoner som i spillet — ikke endre!
function slugWho(w) { return w.toLowerCase().replace(/[^a-z0-9]/g, ''); }
function h32(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(16); }

const AUDDIR = path.join(__dirname, 'audio');
const VDIR = path.join(AUDDIR, 'voice');
const MUSDIR = path.join(AUDDIR, 'music');
fs.mkdirSync(VDIR, { recursive: true });
fs.mkdirSync(MUSDIR, { recursive: true });

const H = { 'xi-api-key': KEY, 'Content-Type': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function genVoice(who, text) {
  const voiceKey = slugWho(who);
  const file = voiceKey + '_' + h32(text) + '.mp3';
  const out = path.join(VDIR, file);
  if (fs.existsSync(out)) { console.log('  finnes:', who, '—', text.slice(0, 40)); return; }
  const voiceId = VOICES[voiceKey === 'sigbjrn' ? 'sigbjorn' : voiceKey];
  if (!voiceId) { console.log('  UKJENT TALER:', who); return; }
  // eleven_turbo_v2_5 støtter language_code — tvinger NORSK uttale (multilingual gjettet dansk!)
  const req = lang => fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '?output_format=mp3_44100_128', {
    method: 'POST', headers: H,
    body: JSON.stringify(Object.assign({
      text: text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.8 }
    }, lang ? { language_code: lang } : {}))
  });
  let r = await req('en');
  if (!r.ok) r = await req(null);
  if (!r.ok) {
    console.log('  FEIL (' + r.status + '):', who, '—', text.slice(0, 40), '|', (await r.text().catch(() => '')).slice(0, 140));
    return;
  }
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  console.log('  generert:', who, '—', text.slice(0, 46));
}

async function genMusic(name, prompt, ms) {
  const out = path.join(MUSDIR, name);
  if (fs.existsSync(out)) { console.log('  finnes:', name); return; }
  // 1) Music API (krever betalt plan)
  let r = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
    method: 'POST', headers: H,
    body: JSON.stringify({ prompt: prompt, music_length_ms: ms })
  });
  if (!r.ok) {
    console.log('  Music API sa nei (' + r.status + ') for ' + name + ', prøver sound-generation i stedet...');
    r = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST', headers: H,
      body: JSON.stringify({ text: prompt, duration_seconds: 22, prompt_influence: 0.4 })
    });
  }
  if (!r.ok) {
    console.log('  FEIL (' + r.status + '):', name, '|', (await r.text().catch(() => '')).slice(0, 140));
    return;
  }
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  console.log('  generert:', name);
}

const SFXDIR = path.join(AUDDIR, 'sfx');
fs.mkdirSync(SFXDIR, { recursive: true });

function writeManifest() {
  const manifest = {
    voice: fs.readdirSync(VDIR).filter(f => f.endsWith('.mp3')),
    music: fs.readdirSync(MUSDIR).filter(f => f.endsWith('.mp3')),
    sfx: fs.readdirSync(SFXDIR).filter(f => f.endsWith('.mp3'))
  };
  fs.writeFileSync(path.join(AUDDIR, 'manifest.json'), JSON.stringify(manifest, null, 1));
  // manifest.js gjer at lyden også virkar når spelet opnast direkte (file://)
  fs.writeFileSync(path.join(AUDDIR, 'manifest.js'), 'window.EMBEDDED_MANIFEST=' + JSON.stringify(manifest) + ';');
  return manifest;
}

(async () => {
  // `node generate-audio.js --manifest` bygger bare manifestet på nytt
  // (bruk etter at du har lagt egne opptak i audio/voice, audio/sfx eller audio/music)
  if (process.argv.includes('--manifest')) {
    const m = writeManifest();
    console.log('Manifest oppdatert: ' + m.voice.length + ' replikker, ' + m.sfx.length + ' effekter, ' + m.music.length + ' musikkspor.');
    return;
  }
  console.log('== Genererer ' + LINES.length + ' stemmereplikker ==');
  for (const [who, text] of LINES) { await genVoice(who, text); await sleep(300); }
  console.log('== Genererer musikk ==');
  for (const [name, prompt, ms] of MUSIC) { await genMusic(name, prompt, ms); await sleep(300); }
  const manifest = writeManifest();
  console.log('== Ferdig! ==');
  console.log('Manifest: ' + manifest.voice.length + ' replikker, ' + manifest.sfx.length + ' effekter, ' + manifest.music.length + ' musikkspor.');
  console.log('Start spillet på nytt (oppdater siden), så brukes lydene automatisk.');
})();
