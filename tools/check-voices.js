#!/usr/bin/env node
// Transcribes every generated voice line back to Malayalam (ElevenLabs Scribe) and scores it
// against the script, to catch mispronounced or garbled generations without listening to all of them.
// Usage: node tools/check-voices.js [lineId ...]
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const env = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.ELEVENLABS_API_KEY || (env.match(/ELEVENLABS_API_KEY=(.+)/) || [])[1]?.trim();
const { LINES } = require(path.join(root, 'game/js/lines.js'));
const only = process.argv.slice(2);

const norm = s => s.replace(/\[[^\]]+\]/g, '').replace(/[\s.,!?…'"“”‘’\-—:]/g, '');
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

(async () => {
  const results = [];
  for (const [id, line] of Object.entries(LINES)) {
    if (only.length && !only.includes(id)) continue;
    const fd = new FormData();
    fd.append('model_id', 'scribe_v1');
    fd.append('language_code', 'mal');
    fd.append('file', new Blob([fs.readFileSync(path.join(root, 'game/audio/voice', id + '.mp3'))]), id + '.mp3');
    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd });
    if (!res.ok) { console.error(`✗ ${id}: ${res.status} ${await res.text()}`); if (res.status === 401 || res.status === 429) break; continue; }
    const heard = (await res.json()).text || '';
    const a = norm(line.ml), b = norm(heard);
    const score = 1 - lev(a, b) / Math.max(a.length, b.length, 1);
    results.push({ id, score, heard });
    console.log(`${score >= 0.8 ? '✓' : '⚠'} ${id.padEnd(11)} ${(score * 100).toFixed(0)}%${score < 0.8 ? '  heard: ' + heard : ''}`);
  }
  const avg = results.reduce((s, r) => s + r.score, 0) / (results.length || 1);
  console.log(`\n${results.length} lines, average match ${(avg * 100).toFixed(0)}%, ${results.filter(r => r.score < 0.8).length} below 80%.`);
  fs.writeFileSync(path.join(root, 'tools/voice-check.json'), JSON.stringify(results, null, 1));
})();
