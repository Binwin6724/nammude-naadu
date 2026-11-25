# Nammude Naadu — നമ്മുടെ നാട്

**Play online:** https://binwin6724.github.io/nammude-naadu/

A playable browser slice of the game: **Prologue → Chapter 1 (Veettilekku) → Chapter 2 (A Morning in Kerala) → Chapter 3 (Appachan's Farm) → Chapter 4 (Pazhaya Koottukaar · Old Friends) → Chapter 5 (Poottiya Muri · The Locked Room)**.
Every character line is voiced in **Malayalam** (ElevenLabs `eleven_v3`, `language_code: "ml"`) with English subtitles.

## Play

```bash
python3 tools/serve.py   # serves the game with caching off
```
Then open http://localhost:8417. (Sound needs the local server; opening the file directly plays without it.)

Controls: WASD / arrows to walk · Shift to run · E / Space to interact (hold E for actions such as sweeping, digging or drawing water) · C to craft · F for the flashlight · Esc for pause and settings (voice and ambience volume, subtitle language, objective marker) or to leave fishing. A gold marker points to the next objective. The title screen offers Continue from the last chapter you reached.

## What's in the slice

- **Prologue:** Dubai flat, the alarm, Appachan's call, the office, Jomon's call, the flight home and the title.
- **Chapter 1:** the bus stop, the auto ride with Jomon, Ammachi on the veranda, Mission 1 (settle in, 4 optional memories), Mission 2 (dinner: coconuts, curry leaves, well water, rice from Vasu Stores at ₹180), dinner, locking up, Appachan's box and note, and the 1 AM investigation with the flashlight.
- **Chapter 2:** hens (feed, water, eggs, the runaway red hen), the rusted key, crafting the bamboo rod, the fishing minigame, Kunjumon's revelation and his canoe leaving, the cooking minigame (meen curry) and lunch.
- **Chapter 3:** the ₹85,000 bank debt, restoring the farm (sharpening the sickle, weeds, branches, the fence, crafting a compost bin, digging beds), planting cheera, chilli, tomato, tapioca and banana, watering, Day 4 sprouts, repairing the pump with Sasi Chettan (₹650), the buried 1996 photograph, and Raghavan's ₹45 lakh offer.
- **Chapter 4:** Jomon's tour of the village, meeting Meera at the school's 75th-anniversary exhibition, repairing Appachan's scooter (clean it, petrol from Jomon's auto, a ₹120 spark plug, Sasi Chettan's repair), riding it (V on/off, H horn, L headlight, petrol you refill at Sasi Motors), a playable football match against the jetty boys, chaya and pazhampori at Balan's tea shop, cleaning the panchayat library with Meera (benches, cobwebs, the broken shelf, sorting books by subject), and the August 1996 newspapers that point to Raghavan.
- **Chapter 5:** the rusted key is stamped P.R.M. Gather six items (flashlight, batteries, sickle, coir rope crafted or bought, crowbar, first-aid kit), clear the old mill road, cross the broken bridge, search the dark burned mill, open the locked room (ledger, photograph, recorder), repair the recorder with Thomas Chettan (belt from Kabeer's scrap yard, tape-head alignment), hear Appachan's tape, and find the envelope at the door
- **Cutscenes:** the night flight and dawn descent over Kerala, the bus to Puzhakkara, the funeral at St. George's Church, and a sunrise montage over the village with the Suprabhatham (played through YouTube's embedded player, so it needs an internet connection).
- **Music:** a procedural score in Kerala ragas (Mohanam, Sivaranjani, Kalyani, Hindolam, Revathi) with tanpura, flute and veena-like plucks that changes with the mood.
- **Ambience:** generated in code — rain on tiles, crickets, frogs, birds, a church bell, the plane cabin and a Mohanam-scale melody.

## Voices

Every character uses a native Malayalam voice from the ElevenLabs library (`--native`, needs a paid plan):

| Character | Native voice |
|---|---|
| Arjun | Amal Suresh |
| Appachan | Vijayesh |
| Ammachi | Solly Rajan |
| Jomon | Abhilash S |
| Kunjumon | Manikandan |
| Vasu Chettan (grocer) | Sandhosh |
| Shibu (Dubai colleague) | Krishna |
| Raghavan | Sanjayan |
| Sasi Chettan | Aby |
| Meera | Namitha |
| Balan Chettan | Godzz |
| Shaji | Akhil |
| Binu | Pranav |
| Thomas Chettan | Vaishakh |
| Kabeer Ikka | Harsh |
| Latha (pharmacist) | Samitha |

All dialogue lives in `game/js/lines.js`: `ml` is what gets spoken and `en` is the subtitle. To add or change a line, edit that file and run:

```bash
node tools/generate-voices.js            # only generates missing lines
node tools/generate-voices.js --force c1_amm1   # re-generates one line
node tools/generate-voices.js --native --force   # re-voices everything with native Malayalam voices (needs a paid ElevenLabs plan)
node tools/check-voices.js               # transcribes every clip back to Malayalam and flags any below 80% match
```

The API key is read from `.env`, which is listed in `.gitignore`. The game never loads the key; it only plays the generated mp3 files.

## Files

- `game/js/engine.js`: loop, camera, lighting, dialogue and voice, objectives, inventory
- `game/js/art.js`: procedural characters, palms, bananas, buildings
- `game/js/world.js`: the four maps and their interactive objects
- `game/js/story.js`: the chapters, the fishing, cooking and crafting systems, and the title screen
- `game/js/audio.js`: the mixer: every voice and recording is levelled when it loads, dialogue ducks everything else, and a limiter with a fixed ceiling keeps sudden loud sounds out
- `game/js/soundscape.js`: area soundscapes (river, garden, paddy, junction, school, pond, forest, mill, house, night...) and the radios
- `game/js/life.js`: villagers, children, a cyclist, the dog, egrets, butterflies and fireflies
- `game/js/touch.js`: on-screen controls for phones and tablets
- `tools/qa-bot.js`: plays the whole game with real key presses and reports problems
- `docs/ISSUES.md`: the issue tracker
- `tools/generate-sounds.js`: generates the area loops and effects with ElevenLabs Sound Effects
- `game/js/ch4.js`: Chapter 4: the scooter, the football match, Balan's tea shop, the library and the newspaper reveal
- `game/js/ch5.js`: Chapter 5: the mill path, bridge, mill, locked room, radio shop, cassette and envelope
- `game/js/audio.js`: voice playback and procedural ambience
- `game/js/polish.js`: objective marker, pause menu and settings, footsteps


## Sound credits

- Voices, area recordings, effects and the original radio song: generated with ElevenLabs
- Old film songs on the tea shop radio (Saregama Carvaan Malayalam, Saregama Malayalam) and Sri Venkateswara Suprabhatham: streamed through YouTube's embedded player, not included in this repository
