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
  // Amerikanske røyster — britiske kringkastarstemmer høyrest feil ut i ein western
  cole:     'pqHfZKP75CvOlQylNhV4', // Bill   — gammal, forvitra. Eldstebroren.
  silas:    'nPczCjzI2devNBz1zQrb', // Brian  — djup og roleg. Skarpskyttaren.
  wade:     'SOYHLrjzK2X1ezoPC6cr', // Harry  — ung og rasande. Yngstemann.
  clay:     'pNInz6obpgDQGcFmaJgB', // Adam   — Clay, hovudpersonen
  forteljar:'JBFqnCBsd6RMkjVDRZzb'  // George — forteljarrøysta i opninga
};
// litt lågare stabilitet + meir stil gjev slitne, dramatiske western-røyster
const VSET = {
  cole:     { stability: 0.34, similarity_boost: 0.82, style: 0.42, use_speaker_boost: true },
  silas:    { stability: 0.42, similarity_boost: 0.85, style: 0.30, use_speaker_boost: true },
  wade:     { stability: 0.26, similarity_boost: 0.80, style: 0.62, use_speaker_boost: true },
  clay:     { stability: 0.40, similarity_boost: 0.82, style: 0.35, use_speaker_boost: true },
  forteljar:{ stability: 0.50, similarity_boost: 0.85, style: 0.45, use_speaker_boost: true }
};

// MÅ matche spillets tekster nøyaktig (filnavn = taler + hash av tekst)
const LINES = [
  ['Wade', "He is down! Stay on your feet, Clay!"],
  ['Silas', "A house is burning! The fire jumps roof to roof. Put those skulls in the dirt before it takes the town!"],
  ['Wade', "One house is cinders. Seven and there is nothing left worth saving, Clay!"],
  ['Cole', "The town is burning, Clay! Shoot them out of the sky!"],
  ['Silas', "SIX gone! One more and Dust Valley dies tonight! SHOOT THEM DOWN!"],
  ['Silas', "Skulls in the sky! Shoot them down before they hit the houses!"],
  ['Cole', "Far enough, stranger. Hands where I can see them. Have they had their teeth in you?"],
  ['Clay', "Name is Clay. Nothing has bitten me yet. Only the sun and the road."],
  ['Wade', "First living face in twenty-two days. We have counted every one of them."],
  ['Silas', "The sickness took Dust Valley whole. Our mother. Our neighbours. Everyone we ever knew is out there walking."],
  ['Cole', "We buried what we could and swore an oath over the graves. We end this plague, or we join it."],
  ['Clay', "Then my road ends here. I will stand with you."],
  ['Wade', "Then arm yourself before dark. There is a shotgun under the saloon floor. Take it."],
  ['Silas', "The dead do not rest here. When the light goes, they come. They always come."],
  ['Cole', "The Plague King is down. God help us... it is over."],
  ['Silas', "The sickness dies with him. Dust Valley can sleep at last."],
  ['Wade', "We would have died out here without you, Clay. All three of us."],
  ['Clay', "The oath is kept, brothers. Let the sun come up on a clean prairie."],
  ['Cole', "This night will not end... Hold the line, Clay. We do not break."],
  ['Cole', "Guns are hot! Give them everything, brothers!"],
  ['Cole', "Feel that in the ground? Something worse than dead is walking tonight."],
  ['Silas', "To the well! Here they come!"],
  ['Cole', "Sit down a minute, Clay. Nine nights. I have watched men break in three."],
  ['Cole', "I buried my mother with these hands. I have not slept a full night since. Neither have my brothers."],
  ['Cole', "We can keep killing them. We are good at it now. But they do not run out, son. We do."],
  ['Cole', "There is a bomb under the church. Old army thing. It will take the valley and everything crawling in it."],
  ['Cole', "So fight on if you have it in you. I will stand beside you either way. But when I give the word, you run for that church and you blow the whole damn thing."],
  ['Clay', "And you three? You will be standing in it."],
  ['Cole', "We swore an oath over those graves. We never swore to walk away from it."],
  ['Cole', "We are going to win this, Clay. One way or the other. Now go get ready."],
  ['Cole', "We cannot hold it, Clay... Arm the bomb in the church!"],
  ['Wade', "There is nothing left to save, Clay! Burn it all!"],
  ['Silas', "MIO! LIGHT IT UP! END IT!"],
  ['Cole', "On your feet, Clay. This town is not done with you yet."],
  ['Cole', "There he is! Put it in his skull!"],
  ['Silas', "Lord above... look at the size of it."],
  ['Wade', "Hold the line, brothers! Not one step back!"],
  ['Cole', "Hold the well! Not one step back!"],
  ['Cole', "They keep coming. So do we. Stand fast, Clay!"],
  ['Cole', "For the oath, brothers! For the oath!"],
  ['Silas', "Head shots. It is the only thing that ends them."],
  ['Silas', "Behind you, Clay!"],
  ['Silas', "I know that face. I buried that man in June."],
  ['Wade', "They are pouring out of the mine!"],
  ['Wade', "Count your shells, Clay. This night is long."],
  ['Wade', "Come on then! We are still standing!"],
  ['Wade', "Did you find the shotgun in the saloon? Silas saw dynamite over by the mine."],
  ['Silas', "The miners hid dynamite in the crates out east. Go get it!"],
  ['Cole', "Something big is stirring underground. Tonight something worse is coming. Be ready."],
  ['Silas', "The Grave Robber was only the beginning. The virus digs deeper."],
  ['Wade', "The hordes grow every night. But so do we."],
  ['Cole', "I hear knives being sharpened in the mine... The Butcher comes tonight."],
  ['Silas', "We are closing in on the source. I can feel it in the air."],
  ['Wade', "One more night, and I reckon the Plague King himself will show."],
  ['Cole', "Tonight it ends, brothers. The Plague King himself. For the pact — for Dust Valley!"],
  ['Cole', "Skulls in the sky! Shoot them down before they hit the houses!"],
  ['Silas', "More of those flying skulls! Blast them out of the sky, Clay!"],
  ['Wade', "Skulls incoming from all sides! Watch the sky!"],
  ['Cole', "Do not let those skulls through!"],
  ['Silas', "They are diving for the roofs! Take them down!"],
  ['Wade', "Another wave of skulls! Keep shooting!"],
  ['Cole', "I am down! Do not leave me out here! I do not want to go like they did!"],
  ['Silas', "I am down! Do not leave me out here! I do not want to go like they did!"],
  ['Wade', "I am down! Do not leave me out here! I do not want to go like they did!"],
  ['Cole', "Argh!"],
  ['Silas', "They bite deep tonight."],
  ['Wade', "I need help over here!"],
  ['Cole', "Thanks, partner. I owe you a life."],
  ['Silas', "That was close. Too close."],
  ['Wade', "Back on my feet. Let us finish it."],
  ['Cole', "Up you get, brother. I have got you."],
  ['Silas', "Up you get, brother. I have got you."],
  ['Wade', "Up you get, brother. I have got you."],
  ['Cole', "Stay near the well after dark. We cover each other."],
  ['Cole', "The revolver is faithful. The shotgun clears a room."],
  ['Cole', "You took our oath the day you stayed, Clay."],
  ['Silas', "Dynamite settles most arguments out here."],
  ['Silas', "Aim for the head, Clay. Always the head."],
  ['Silas', "Something with red eyes moved in the mine last night."],
  ['Wade', "Beans and whiskey put a man back together."],
  ['Wade', "Every third night brings something worse. Keep count."],
  ['Wade', "My brothers say we will win. I have decided to believe them."],
  ['Forteljar', "The western frontier. Eighteen eighty seven. Out past the last railhead, where the maps go blank and no law has ever ridden."],
  ['Forteljar', "A sickness came down out of the mine. It took the town of Dust Valley in a single week. It did not let the dead lie still."],
  ['Forteljar', "Everyone who could run, ran. Three brothers stayed. They buried what was left of their kin, and they swore an oath over the graves."],
  ['Forteljar', "They do not expect to see the other side of this. They expect to win anyway."],
];

const MUSIC = [
  ['day.mp3', 'Lonesome spaghetti western theme. Solo nylon guitar picking a slow minor melody, distant whistling, mournful harmonica, brushed snare like a walking horse, warm upright bass. Dusty, sunlit, heavy with loss. Sparse, patient. Instrumental loop.', 120000],
  ['night.mp3', 'Western horror score, town under siege at night. Droning cello, detuned strings on one uneasy chord, slow heartbeat kick drum, sparse dissonant piano, scraped metal, distant warped harmonica. Patient, menacing, hopeless. Instrumental loop.', 120000],
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
  const voiceId = VOICES[voiceKey];
  if (!voiceId) { console.log('  UKJENT TALER:', who); return; }
  // eleven_turbo_v2_5 støtter language_code — tvinger NORSK uttale (multilingual gjettet dansk!)
  const req = lang => fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '?output_format=mp3_44100_128', {
    method: 'POST', headers: H,
    body: JSON.stringify(Object.assign({
      text: text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: VSET[voiceKey] || { stability: 0.4, similarity_boost: 0.82, style: 0.4, use_speaker_boost: true }
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
