# ☠ PRAIRIE OF THE DEAD ☠
### Et 3D zombie-western FPS — Dust Valley, 1887

**🎮 Spill nå: https://krbj.github.io/prairie-of-the-dead/** *(krever passord — spør eieren!)*

Mio ankommer den forlatte cowboylandsbyen Dust Valley, der brødrene John, Sigbjørn
og Kristoffer har sverget en pakt: utslett zombie-viruset — eller dø i forsøket.
Samle våpen om dagen, overlev hordene om natten. Hver tredje natt kommer en boss.
På siste nivå venter gatling-kanoner på takene, flygende dødninghoder, en 270 meter
høy koloss... og en atombombe i kirken.

## ▶ Slik spiller du

**Åpne lenken over**, eller **dobbeltklikk `index.html`** — det er alt! Spillet kjører
i nettleseren (Chrome/Edge anbefales) og all lyd/tale følger med i mappa.
Krever internett første gang (henter 3D-motoren og skrifttyper fra CDN).

| Tast | Handling |
|---|---|
| WASD | beveg deg (Shift = løp, Mellomrom = hopp) |
| Mus / venstreklikk | sikt og skyt |
| 1–6 | revolver · hagle · motorsag · dynamitt · gatling · bazooka |
| R | lad om (lades også automatisk) |
| E | plukk opp / snakk / gjenoppliv / bemann gatling / **aktiver atombomba** |
| X | slow motion (etter 8 drap) |
| Esc / M | pause / lyd av-på |

I hovedmenyen kan du velge hvilken dag du vil starte på (1–12).

## 📤 Slik deler du spillet med andre

**Enklest — del lenken:** https://krbj.github.io/prairie-of-the-dead/
(husk å dele passordet også!)

**Eller send mappa:**
1. Høyreklikk mappa `3dzombiecowboyspill` → *Komprimer til ZIP-fil* (~5 MB)
2. Send zip-en (e-post, Messenger, minnepinne...)
3. Mottakeren pakker ut og dobbeltklikker `index.html` — ferdig!

## 🎙 Lag dine egne stemmer og lyder

- **MANUS.md** — innspillingsmanus for alle 76 replikker (engelsk), sortert
  per rolle med toneanvisning og eksakt filnavn
- **LYDLISTE.md** — komplett liste over lydeffekter og musikkspor du kan erstatte

Legg MP3-filene i `audio/voice/`, `audio/sfx/` eller `audio/music/`, og kjør:
```
node generate-audio.js --manifest
```
(Krever [Node.js](https://nodejs.org). Vil du generere nye AI-stemmer med ElevenLabs,
lagre API-nøkkelen din i `elevenlabs-key.txt` her i mappa og kjør uten `--manifest`.
**Ikke del mappa eller repoet med nøkkelfila i!** — `.gitignore` beskytter deg.)

## 📁 Innhold

```
index.html          ← hele spillet (dobbeltklikk denne)
audio/voice/        ← 76 talte replikker (ElevenLabs, engelsk)
audio/music/        ← dag-, natt-, boss- og finalemusikk
audio/sfx/          ← (tom — legg egne lydeffekter her)
audio/manifest.*    ← liste over lydfiler (auto-generert)
generate-audio.js   ← regenererer stemmer/manifest
MANUS.md            ← innspillingsmanus
LYDLISTE.md         ← teknisk lydliste
```

Laget med Claude Code · Three.js · ElevenLabs
