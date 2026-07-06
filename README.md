# ☠ DØDENS PRÆRIE ☠
### Et 3D zombie-western FPS — Støvdalen, 1887

Mio ankommer den forlatte cowboylandsbyen Støvdalen, der brødrene John, Sigbjørn
og Kristoffer har sverget en pakt: utslett zombie-viruset — eller dø i forsøket.
Samle våpen om dagen, overlev hordene om natten. Hver tredje natt kommer en boss.
På siste nivå venter gatling, bazooka... og en atombombe i kirken.

## ▶ Slik spiller du

**Dobbeltklikk `index.html`** — det er alt! Spillet kjører i nettleseren
(Chrome/Edge anbefales) og all lyd/tale følger med i mappa.
Krever internett første gang (henter 3D-motoren og skrifttyper fra CDN).

| Tast | Handling |
|---|---|
| WASD | beveg deg (Shift = løp, Mellomrom = hopp) |
| Mus / venstreklikk | sikt og skyt |
| 1–6 | revolver · hagle · motorsag · dynamitt · gatling · bazooka |
| R | lad om (lades også automatisk) |
| E | plukk opp / snakk / gjenoppliv / **aktiver atombomba** |
| Esc / M | pause / lyd av-på |

I hovedmenyen kan du velge hvilken dag du vil starte på (1–12).

## 📤 Slik deler du spillet med andre

**Enklest — send mappa:**
1. Høyreklikk mappa `3dzombiecowboyspill` → *Komprimer til ZIP-fil* (~5 MB)
2. Send zip-en (e-post, Messenger, minnepinne...)
3. Mottakeren pakker ut og dobbeltklikker `index.html` — ferdig!

**Best — legg det på nett (gratis, gir deg en lenke alle kan åpne):**
- **[itch.io](https://itch.io)** (laget for spill): opprett bruker → *Upload new project* →
  last opp zip-en → huk av *«This file will be played in the browser»* → publiser.
  Da får du en side hvor hvem som helst spiller rett i nettleseren.
- **[Netlify Drop](https://app.netlify.com/drop)**: dra hele mappa inn i nettsiden →
  du får en offentlig lenke på sekunder.
- **GitHub Pages**: legg mappa i et repo → Settings → Pages → ferdig.

## 🎙 Lag dine egne stemmer og lyder

- **MANUS.md** — innspillingsmanus for alle 63 replikker (sunnmørsk!), sortert
  per rolle med toneanvisning og eksakt filnavn
- **LYDLISTE.md** — komplett liste over lydeffekter og musikkspor du kan erstatte

Legg MP3-filene i `audio/voice/`, `audio/sfx/` eller `audio/music/`, og kjør:
```
node generate-audio.js --manifest
```
(Krever [Node.js](https://nodejs.org). Vil du generere nye AI-stemmer med ElevenLabs,
lagre API-nøkkelen din i `elevenlabs-key.txt` her i mappa og kjør uten `--manifest`.
**Ikke del mappa med nøkkelfila i!**)

## 📁 Innhold

```
index.html          ← hele spillet (dobbeltklikk denne)
audio/voice/        ← 63 talte replikker (ElevenLabs, sunnmørsk)
audio/music/        ← dag-, natt-, boss- og finalemusikk
audio/sfx/          ← (tom — legg egne lydeffekter her)
audio/manifest.*    ← liste over lydfiler (auto-generert)
generate-audio.js   ← regenererer stemmer/manifest
MANUS.md            ← innspillingsmanus
LYDLISTE.md         ← teknisk lydliste
```

Laget med Claude Code · Three.js · ElevenLabs
