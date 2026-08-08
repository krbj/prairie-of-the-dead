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
  ['Clay', "I did not think it would end like this, Cole."],
  ['Cole', "End? No, son. It does not end here. Dying is just another stretch of road. Every man rides it sooner or later."],
  ['Clay', "And what is waiting at the end of it?"],
  ['Cole', "The dust lifts. All that grey burns off you like morning haze off the flats. And then you see it."],
  ['Clay', "See what?"],
  ['Cole', "White shores, Clay. And past them, green country with no end to it, under a sun that never quite sets."],
  ['Cole', "Rivers running clean. And every soul this valley took, standing out in that sun, waiting on you."],
  ['Clay', "Well. That does not sound so bad."],
  ['Cole', "No. No, it does not. Now load your gun, son. We have got one more night to get through first."],
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
  ['Silas', "CLAY! LIGHT IT UP! END IT!"],
  ['Cole', "On your feet, Clay. This town is not done with you yet."],
  ['Cole', "There he is! Put it in his skull!"],
  ['Silas', "Lord above... look at the size of it."],
  ['Wade', "Hold the line, brothers! Not one step back!"],
  ['Cole', "Hold the well! Not one step back!"],
  ['Cole', "They keep coming. So do we. Stand fast, Clay!"],
  ['Cole', "For the oath, brothers! For the oath!"],
  ['Cole', "Steady. Pick your shots. Panic kills faster than they do."],
  ['Cole', "I have got the left. Clay, watch our backs!"],
  ['Cole', "Another wave. Let them come."],
  ['Cole', "Do not look at their faces, boys. You will know too many of them."],
  ['Silas', "Head shots. It is the only thing that ends them."],
  ['Silas', "Behind you, Clay!"],
  ['Silas', "I know that face. I buried that man in June."],
  ['Silas', "Reloading. Cover the gap."],
  ['Silas', "That one was the schoolteacher. God forgive me."],
  ['Silas', "They do not tire. Remember that and keep moving."],
  ['Silas', "Clear on my side. For now."],
  ['Wade', "They are pouring out of the mine!"],
  ['Wade', "Count your shells, Clay. This night is long."],
  ['Wade', "Come on then! We are still standing!"],
  ['Wade', "How many is that? I lost count hours ago."],
  ['Wade', "My hands will not stop shaking. Do not tell Cole."],
  ['Wade', "We are going to see the sun come up. Say it with me."],
  ['Cole', "If I turn, you put me down. That is an order, not a favour."],
  ['Cole', "Powder is dry, hands are steady. That is all a man gets."],
  ['Cole', "Do not think that far ahead. Think as far as sunrise."],
  ['Cole', "Save your prayers, Wade. Save your bullets first."],
  ['Cole', "The well is behind you. It always is. Fall back if you must."],
  ['Silas', "I counted the graves this morning. There are not enough."],
  ['Silas', "The dogs stopped barking an hour ago. That is never good."],
  ['Silas', "There is no bottom to that mine. We stopped asking what is down there."],
  ['Silas', "Aim for the head. It is the only part that still argues."],
  ['Silas', "Every one of them knew my name once."],
  ['Wade', "If I go down tonight, do not let me get back up. Promise me."],
  ['Wade', "Do you ever wonder if we are the last ones? Anywhere?"],
  ['Wade', "My brother says we are winning. My brother lies beautifully."],
  ['Wade', "Beans, whiskey and the dead. This town has everything."],
  ['Wade', "I have decided to live forever. So far it is working."],
  ['Wade', "You know what I miss? Doors. Doors that stayed shut."],
  ['Cole', "Clay. Clay, that was my grandmother. ... Fine shot, though."],
  ['Cole', "That one married us in the church. Now look at him."],
  ['Cole', "Do not apologise. She would have done the same to you."],
  ['Cole', "Every face out there belonged to someone. Shoot them anyway."],
  ['Cole', "That is the Widow Hale. Put another in her, she is still twitching."],
  ['Silas', "Hey Clay. That was the last of my family walking. Thanks, I suppose."],
  ['Silas', "You just put down the man who taught me to read."],
  ['Silas', "Aunt Ruth. She never liked me much either."],
  ['Silas', "That was the preacher. He did say the dead would rise. Nobody laughed twice."],
  ['Silas', "Good shot. Bad memory."],
  ['Wade', "That was the mayor! He owed me four dollars!"],
  ['Wade', "That is three of my cousins tonight. Three!"],
  ['Wade', "That was the barber. He was a terrible barber."],
  ['Wade', "Sorry, missus Abernathy!"],
  ['Wade', "Was that... yes. That was my schoolmaster. I feel nothing. Is that bad?"],
  ['Wade', "I owed that man money. It feels rude to be relieved."],
  ['Cole', "Powder, shot, water, bandages. In that order. Every morning."],
  ['Cole', "Check the buckets. Fire takes this town faster than they do."],
  ['Cole', "Eat something, Clay. You are no use to me thin and brave."],
  ['Cole', "Sleep in your boots. You will not get the time to lace them."],
  ['Silas', "Sleep while it is light. The dark does not care that you are tired."],
  ['Silas', "I keep setting four plates. Habit is a cruel thing."],
  ['Silas', "I cleaned my rifle twice. There is nothing else left to do."],
  ['Silas', "Wade ate the chickens. He will tell you it was the dead."],
  ['Wade', "I washed the blood off the porch. It comes back every night."],
  ['Wade', "Found a doll in the street this morning. I did not pick it up."],
  ['Wade', "Nice day. Shame about the circumstances."],
  ['Wade', "The chickens are gone. Either the dead got them, or Silas did."],
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
  ['Cole', "Up you get, brother. I have got you."],
  ['Silas', "Up you get, brother. I have got you."],
  ['Wade', "Up you get, brother. I have got you."],
  ['Forteljar', "The western frontier. Eighteen eighty seven. Out past the last railhead, where the maps go blank and no law has ever ridden."],
  ['Forteljar', "A sickness came down out of the mine. It took the town of Dust Valley in a single week. It did not let the dead lie still."],
  ['Forteljar', "Everyone who could run, ran. Three brothers stayed. They buried what was left of their kin, and they swore an oath over the graves."],
  ['Forteljar', "They do not expect to see the other side of this. They expect to win anyway."],
  ['Cole', "Argh!"],
  ['Cole', "They got a piece of me!"],
  ['Cole', "Still standing. Keep firing!"],
  ['Silas', "They bite deep tonight."],
  ['Silas', "That one had teeth."],
  ['Silas', "I am hit. Hold the line."],
  ['Wade', "I need help over here!"],
  ['Wade', "It hurts! It really hurts!"],
  ['Wade', "Get them off me!"],
  ['Cole', "Thanks, partner. I owe you a life."],
  ['Cole', "I am not done yet. Not by a long way."],
  ['Silas', "That was close. Too close."],
  ['Silas', "I saw the other side just then. I did not care for it."],
  ['Wade', "Back on my feet. Let us finish it."],
  ['Wade', "You came back for me. Nobody has done that in a while."],
  ['Cole', "Stay near the well after dark. We cover each other."],
  ['Cole', "The revolver is faithful. The shotgun clears a room."],
  ['Cole', "You took our oath the day you stayed, Clay."],
  ['Cole', "Sleep when you can. You will not get the chance after sundown."],
  ['Cole', "My father built the saloon with his own hands. He is out there somewhere."],
  ['Cole', "Do not waste a shot on the ones that are already down."],
  ['Silas', "Dynamite settles most arguments out here."],
  ['Silas', "Aim for the head, Clay. Always the head."],
  ['Silas', "Something with red eyes moved in the mine last night."],
  ['Silas', "I keep my rifle clean. It is the only thing I still control."],
  ['Silas', "The church door has held so far. So far."],
  ['Silas', "Every third night the ground shakes before they come. Listen for it."],
  ['Wade', "Beans and whiskey put a man back together."],
  ['Wade', "Every third night brings something worse. Keep count."],
  ['Wade', "My brothers say we will win. I have decided to believe them."],
  ['Wade', "There is a bucket at every house. Water beats fire, Clay."],
  ['Wade', "I was seventeen when this started. I do not feel it anymore."],
  ['Wade', "Check the roofs. High ground is the only ground worth having."],
];

const MUSIC = [
  ['day.mp3', 'Lonesome spaghetti western theme. Solo nylon guitar picking a slow minor melody, distant whistling, mournful harmonica, brushed snare like a walking horse, warm upright bass. Dusty, sunlit, heavy with loss. Sparse, patient. Instrumental loop.', 120000],
  ['night.mp3', 'Western horror score, town under siege at night. Droning cello, detuned strings on one uneasy chord, slow heartbeat kick drum, sparse dissonant piano, scraped metal, distant warped harmonica. Patient, menacing, hopeless. Instrumental loop.', 120000],
  // Bosskampen: KATEDRALKLOKKER som slaar ein stodig, ubonnhorleg takt gjennom
  // heile sporet -- alt anna ligg under klokkene.
  ['boss.mp3', 'Inside a vast stone cathedral. Enormous bells tolling a slow steady rhythm with long echoing decay. A dramatic male choir chanting underneath, low and rhythmic like a mass. Dark strings and deep drums far behind. Sacred, heavy, doomed.', 75000],
  // Siste natta: STORT og filmatisk, ikkje masete. Tunge trommer og djup messing
  // i staden for den skrikande gitaren som gjekk ein pa nervane.
  ['final.mp3', 'Dark cinematic orchestral western. Slow thunderous war drums, deep brass swells, low male choir humming one note, sustained ominous strings, distant tolling bell. Grand, heavy and doomed. Not frantic. Instrumental.', 75000],
  // Cole sin tale: stille, sorgtungt og fast
  ['speech.mp3', 'Quiet emotional cinematic score. Lone acoustic guitar picking softly, warm strings rising slowly underneath, single sustained piano notes. Sorrowful but steady and resolute. Very sparse and patient. Instrumental.', 60000],
  // Visjonen om dei kvite strendene
  ['vision.mp3', 'Ethereal uplifting cinematic score. Airy wordless female choir, shimmering high strings, soft harp arpeggios, warm brass swelling gently. Peaceful, radiant, heavenly, full of light. Instrumental.', 60000]
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
      body: JSON.stringify({ text: prompt, duration_seconds: 30, prompt_influence: 0.4, loop: true })
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
