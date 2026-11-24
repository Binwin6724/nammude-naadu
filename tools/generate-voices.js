#!/usr/bin/env node
// Generates Malayalam voice lines with ElevenLabs (eleven_v3, language_code "ml").
// By default uses ElevenLabs built-in voices (free plan). With --native it uses each character's native
// Malayalam library voice (paid plan): the voice is added to the account, used, then removed again.
// Lines with emotion tags like [crying] use the expressive 'creative' setting (stability 0).
// Reads ELEVENLABS_API_KEY from ../.env. Skips lines whose mp3 already exists unless --force.
// Usage: node tools/generate-voices.js [--force] [--native] [--who=arjun,ammachi] [lineId ...]
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const env = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.ELEVENLABS_API_KEY || (env.match(/ELEVENLABS_API_KEY=(.+)/) || [])[1]?.trim();
if (!KEY) { console.error('Missing ELEVENLABS_API_KEY in .env'); process.exit(1); }
const API = 'https://api.elevenlabs.io';
const H = { 'xi-api-key': KEY };

const { VOICES, LINES } = require(path.join(root, 'game/js/lines.js'));
const outDir = path.join(root, 'game/audio/voice');
fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const force = args.includes('--force');
const native = args.includes('--native');
const whoArg = (args.find(a => a.startsWith('--who=')) || '').slice(6).split(',').filter(Boolean);
const only = args.filter(a => !a.startsWith('--'));

async function addVoice(v, who) {
  const res = await fetch(`${API}/v1/voices/add/${v.owner}/${v.voice}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ new_name: `NN ${who}` }) });
  if (!res.ok) throw new Error(`add voice for ${who}: ${res.status} ${await res.text()}`);
  return (await res.json()).voice_id;
}
async function removeVoice(id) { await fetch(`${API}/v1/voices/${id}`, { method: 'DELETE', headers: H }); }

(async () => {
  const todo = Object.entries(LINES).filter(([id, l]) =>
    (!only.length || only.includes(id)) && (!whoArg.length || whoArg.includes(l.who)) &&
    (force || !fs.existsSync(path.join(outDir, id + '.mp3'))));
  const byWho = {};
  for (const [id, l] of todo) (byWho[l.who] = byWho[l.who] || []).push([id, l]);
  let chars = 0, made = 0, failed = 0;
  for (const [who, list] of Object.entries(byWho)) {
    const v = VOICES[who];
    let vid = v.voice, added = null;
    if (native && v.native) { added = await addVoice({ voice: v.native, owner: v.owner }, who); vid = added; }
    try {
      for (const [id, line] of list) {
        const res = await fetch(`${API}/v1/text-to-speech/${vid}?output_format=mp3_44100_128`, {
          method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: line.ml, model_id: 'eleven_v3', language_code: 'ml', voice_settings: { stability: line.stability ?? (/\[/.test(line.ml) ? 0.0 : 0.5), similarity_boost: 0.8 } }),
        });
        if (!res.ok) { failed++; console.error(`✗ ${id}: ${res.status} ${await res.text()}`); if (res.status === 401 || res.status === 429) throw new Error('stopping'); continue; }
        fs.writeFileSync(path.join(outDir, id + '.mp3'), Buffer.from(await res.arrayBuffer()));
        chars += line.ml.length; made++;
        console.log(`✓ ${id} (${who})`);
      }
    } finally { if (added) await removeVoice(added); }
  }
  console.log(`\nGenerated ${made} lines, ~${chars} characters, ${failed} failed.`);
})().catch(e => { console.error(e.message); process.exit(1); });
