#!/usr/bin/env node
// Generates the area ambience loops and one-shot effects with ElevenLabs Sound Effects.
// Reads ELEVENLABS_API_KEY from ../.env. Skips files that exist unless --force.
// Usage: node tools/generate-sounds.js [--force] [--list] [name ...]
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const env = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.ELEVENLABS_API_KEY || (env.match(/ELEVENLABS_API_KEY=(.+)/) || [])[1]?.trim();
if (!KEY) { console.error('Missing ELEVENLABS_API_KEY in .env'); process.exit(1); }
// name: [folder, seconds, prompt]   (amb = seamless loops)
const SOUNDS = {
  river:   ['amb', 18, 'Wide calm tropical river flowing past a sandy bank, gentle lapping water, soft and soothing field recording, no birds, no people'],
  garden:  ['amb', 20, 'Peaceful tropical village garden in the morning, soft songbirds at a distance, bulbul and sparrow chirps, light breeze in banana leaves, warm gentle field recording, no people, no harsh sounds'],
  paddy:   ['amb', 16, 'Open rice paddy field in daytime, soft breeze moving through tall grass, faint distant birds, very calm field recording'],
  street:  ['amb', 16, 'Quiet small Indian village junction, distant soft chatter, a bicycle bell far away, faint scooter passing far off, calm daytime field recording'],
  teashop: ['amb', 20, 'Inside a small Indian roadside tea shop, low murmur of men talking, tea glasses clinking softly, tea being poured from height, kettle steam, cosy'],
  forest:  ['amb', 18, 'Deep tropical forest, rustling leaves, soft distant birds, gentle insects, mysterious and calm field recording'],
  night:   ['amb', 18, 'Soft tropical village night, gentle low crickets in the distance, calm and warm, quiet field recording, no loud insects'],
  frogs:   ['amb', 14, 'Frogs croaking softly around a village pond at night, distant, gentle'],
  mill:    ['amb', 16, 'Inside an abandoned ruined brick building, hollow low wind, occasional water drips echoing, faint wood creaks, eerie but quiet'],
  house:   ['amb', 14, 'Quiet old house interior, soft slow wall clock ticking, faint muffled birds outside, calm room tone'],
  kitchen: ['amb', 12, 'Small wood fire crackling gently in a clay stove, a pot simmering softly'],
  rain:    ['amb', 20, 'Steady monsoon rain falling on leaves and clay roof tiles, soft and soothing, no thunder'],
  school:  ['amb', 14, 'School children playing and laughing far away in a schoolyard, distant and soft'],
  hens:    ['amb', 14, 'A few hens clucking softly and scratching in a village yard, calm, close'],
  pond:    ['amb', 14, 'Small still pond, gentle water ripples and soft plops, dragonfly, very calm'],
  bike:    ['sfx', 4, 'Old Indian scooter engine idling steadily, two stroke putt putt, medium distance, constant loop'],
  auto:    ['sfx', 2.5, 'Indian auto rickshaw engine starting and driving away'],
  horn:    ['sfx', 0.8, 'Short friendly old scooter horn beep beep, soft'],
  splash:  ['sfx', 1.2, 'Bucket of water poured and splashing gently'],
  knock:   ['sfx', 0.6, 'Single knock of a hammer tapping on wood, dry'],
  door:    ['sfx', 1.2, 'Old wooden door creaks open softly'],
  doorknock: ['sfx', 1.4, 'Three firm knocks on an old wooden door'],
  sweep:   ['sfx', 0.8, 'One stroke of a coconut broom sweeping a floor'],
  dig:     ['sfx', 0.8, 'A hoe digging into soft soil once'],
  rustle:  ['sfx', 0.9, 'Leaves and paper rustling softly'],
  cut:     ['sfx', 0.8, 'Sickle slicing through thick grass once'],
  creak:   ['sfx', 0.9, 'Old wooden plank creaks under weight'],
  bell:    ['sfx', 3.5, 'Single distant church bell toll, soft long decay'],
  shutter: ['sfx', 0.6, 'Single camera shutter click'],
  tape:    ['sfx', 0.6, 'Cassette tape recorder button pressed, mechanical clunk'],
  phone:   ['sfx', 2, 'Soft old mobile phone ringtone ringing twice, gentle'],
};
(async () => {
  const a = process.argv.slice(2), force = a.includes('--force'), only = a.filter(x => !x.startsWith('--')); let cost = 0;
  for (const [name, [dir, sec, text]] of Object.entries(SOUNDS)) {
    if (only.length && !only.includes(name)) continue;
    const out = path.join(root, 'game/audio', dir, name + '.mp3'); if (!force && fs.existsSync(out)) continue;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', { method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, duration_seconds: sec, prompt_influence: 0.45, loop: dir === 'amb' || name === 'bike', model_id: 'eleven_text_to_sound_v2' }) });
    if (!res.ok) { console.error(`✗ ${name}: ${res.status} ${(await res.text()).slice(0, 200)}`); if (res.status === 401 || res.status === 429) break; continue; }
    fs.writeFileSync(out, Buffer.from(await res.arrayBuffer())); const c = +(res.headers.get('character-cost') || 0); cost += c; console.log(`✓ ${dir}/${name} ${sec}s cost ${c}`);
  }
  console.log('Total cost', cost);
})();
