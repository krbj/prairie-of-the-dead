# â˜  PRAIRIE OF THE DEAD â˜ 
### Et 3D zombie-western FPS â€” Dust Valley, 1887

**ðŸŽ® Spill nÃ¥: https://krbj.github.io/prairie-of-the-dead/** *(krever passord â€” spÃ¸r eieren!)*

Mio ankommer den forlatte cowboylandsbyen StÃ¸vdalen, der brÃ¸drene John, SigbjÃ¸rn
og Kristoffer har sverget en pakt: utslett zombie-viruset â€” eller dÃ¸ i forsÃ¸ket.
Samle vÃ¥pen om dagen, overlev hordene om natten. Hver tredje natt kommer en boss.
PÃ¥ siste nivÃ¥ venter gatling, bazooka... og en atombombe i kirken.

## â–¶ Slik spiller du

**Dobbeltklikk `index.html`** â€” det er alt! Spillet kjÃ¸rer i nettleseren
(Chrome/Edge anbefales) og all lyd/tale fÃ¸lger med i mappa.
Krever internett fÃ¸rste gang (henter 3D-motoren og skrifttyper fra CDN).

| Tast | Handling |
|---|---|
| WASD | beveg deg (Shift = lÃ¸p, Mellomrom = hopp) |
| Mus / venstreklikk | sikt og skyt |
| 1â€“6 | revolver Â· hagle Â· motorsag Â· dynamitt Â· gatling Â· bazooka |
| R | lad om (lades ogsÃ¥ automatisk) |
| E | plukk opp / snakk / gjenoppliv / **aktiver atombomba** |
| Esc / M | pause / lyd av-pÃ¥ |

I hovedmenyen kan du velge hvilken dag du vil starte pÃ¥ (1â€“12).

## ðŸ“¤ Slik deler du spillet med andre

**Enklest â€” send mappa:**
1. HÃ¸yreklikk mappa `3dzombiecowboyspill` â†’ *Komprimer til ZIP-fil* (~5 MB)
2. Send zip-en (e-post, Messenger, minnepinne...)
3. Mottakeren pakker ut og dobbeltklikker `index.html` â€” ferdig!

**Best â€” legg det pÃ¥ nett (gratis, gir deg en lenke alle kan Ã¥pne):**
- **[itch.io](https://itch.io)** (laget for spill): opprett bruker â†’ *Upload new project* â†’
  last opp zip-en â†’ huk av *Â«This file will be played in the browserÂ»* â†’ publiser.
  Da fÃ¥r du en side hvor hvem som helst spiller rett i nettleseren.
- **[Netlify Drop](https://app.netlify.com/drop)**: dra hele mappa inn i nettsiden â†’
  du fÃ¥r en offentlig lenke pÃ¥ sekunder.
- **GitHub Pages**: legg mappa i et repo â†’ Settings â†’ Pages â†’ ferdig.

## ðŸŽ™ Lag dine egne stemmer og lyder

- **MANUS.md** â€” innspillingsmanus for alle 76 replikker (sunnmÃ¸rsk!), sortert
  per rolle med toneanvisning og eksakt filnavn
- **LYDLISTE.md** â€” komplett liste over lydeffekter og musikkspor du kan erstatte

Legg MP3-filene i `audio/voice/`, `audio/sfx/` eller `audio/music/`, og kjÃ¸r:
```
node generate-audio.js --manifest
```
(Krever [Node.js](https://nodejs.org). Vil du generere nye AI-stemmer med ElevenLabs,
lagre API-nÃ¸kkelen din i `elevenlabs-key.txt` her i mappa og kjÃ¸r uten `--manifest`.
**Ikke del mappa med nÃ¸kkelfila i!**)

## ðŸ“ Innhold

```
index.html          â† hele spillet (dobbeltklikk denne)
audio/voice/        â† 63 talte replikker (ElevenLabs, sunnmÃ¸rsk)
audio/music/        â† dag-, natt-, boss- og finalemusikk
audio/sfx/          â† (tom â€” legg egne lydeffekter her)
audio/manifest.*    â† liste over lydfiler (auto-generert)
generate-audio.js   â† regenererer stemmer/manifest
MANUS.md            â† innspillingsmanus
LYDLISTE.md         â† teknisk lydliste
```

Laget med Claude Code Â· Three.js Â· ElevenLabs

