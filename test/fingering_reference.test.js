import test from 'node:test';
import assert from 'node:assert/strict';
import {findVoicings,diagram,chordCards} from '../src/chords.js';
import {planFingering,referenceFingering} from '../src/fingering.js';
test('Casa de Bamba: Bbm usa dedos 2–3–1–4 sem pestana',()=>{
 const v=findVoicings('Bbm').results.find(v=>v.frets.join()==='3,3,2,3');
 assert.ok(v);assert.deepEqual(v.notes,['F','Bb','Db','F']);assert.deepEqual(v.fingering.fingers,[2,3,1,4]);assert.equal(v.fingering.fingerCount,4);assert.deepEqual(v.fingering.barres,[]);assert.equal(v.fingering.origin,'reference');assert.ok(!diagram(v).includes('class="chord-barre"'));assert.match(chordCards('Bbm'),/Casa de Bamba/);
});
test('padrão menor móvel mantém a digitação da referência quando transposto',()=>{
 for(let delta=-1;delta<=9;delta++){
  const symbol=['A','Bb','B','C','C#','D','Eb','E','F','F#','G'][delta+1]+'m';
  const frets=[3,3,2,3].map(f=>f+delta),v=findVoicings(symbol).results.find(v=>v.frets.join()===frets.join());
  assert.ok(v,symbol);assert.deepEqual(v.fingering.fingers,[2,3,1,4],symbol);assert.equal(v.fingering.barres.length,0);
 }
});
test('referência documentada prevalece sobre a sugestão geométrica sem alterar outras famílias',()=>{
 const planned=planFingering([3,3,2,3]);assert.deepEqual(planned.fingers,[2,3,1,4]);assert.equal(planned.barres.length,0);
 const actual=findVoicings('Bbm').results.find(v=>v.frets.join()==='3,3,2,3');assert.equal(actual.fingering.barres.length,0);assert.deepEqual(actual.fingering.fingers,[2,3,1,4]);
 assert.ok(planFingering([7,5,5,5]).barres.some(b=>b.fret===5));
});
test('digitação cadastrada inconsistente é recusada em vez de inventar pestana',()=>{
 assert.equal(referenceFingering([3,3,2,3],{fingers:[2,2,1,4],barres:[]}),null);
 assert.equal(referenceFingering([3,0,2,3],{fingers:[2,3,1,4],barres:[]}),null);
 assert.equal(referenceFingering([3,3,2,3],{fingers:[2,3,1,5],barres:[]}),null);
 assert.ok(referenceFingering([3,3,2,3],{fingers:[2,3,1,4],barres:[]}));
});

test('Am7 mantém a forma completa e oferece a pestana reduzida na consulta normal',()=>{
 const html=chordCards('Am7');
 assert.match(html,/data-shape="7,5,5,5"/);
 assert.match(html,/data-shape="5,5,5,5"/);
 const v=findVoicings('Am7').results.find(v=>v.frets.join()==='5,5,5,5');
 assert.deepEqual(v.notes,['G','C','E','G']);
 assert.deepEqual(v.fingering.fingers,[1,1,1,1]);
 assert.deepEqual(v.omitted.map(t=>t.note),['A']);
 assert.equal(v.fingering.barres.length,1);
 assert.ok(html.indexOf('data-shape="5,5,5,5"')<html.indexOf('more-chord-shapes')||!html.includes('more-chord-shapes'));
 assert.match(html,/As notas também formam C\/G/);
});

test('7/4 das cifras brasileiras equivale a 7sus4, sem terça, em todas as fundamentais',()=>{
 for(const root of ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']){
  const slash=findVoicings(root+'7/4'),sus=findVoicings(root+'7sus4');
  assert.deepEqual(slash.chord.intervals,sus.chord.intervals);
  assert.equal(slash.chord.quality,'7sus4');
  assert.ok(!slash.chord.tones.some(t=>t.degree===3));
  assert.ok(slash.results.length);
 }
});
