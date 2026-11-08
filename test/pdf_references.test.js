import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PDF_SOURCE,PDF_REFERENCES} from '../src/pdf-references.js';
import {findVoicings,parseChord,chordCards,tuning} from '../src/chords.js';
import {referenceFingering} from '../src/fingering.js';
import {selectPrimary,findReferenceFingering} from '../src/shape-priority.js';
const audit=JSON.parse(fs.readFileSync(new URL('../audit/pdf-sequencias-review.json',import.meta.url)));
const fingerKey=p=>JSON.stringify([p.fingers,p.barres.map(b=>[b.fret,b.from,b.to,b.finger])]);
test('todas as digitações aceitas do PDF preservam notas, dedos, pestanas e rastreabilidade',()=>{
 assert.equal(PDF_SOURCE.sha256,audit.source.sha256);assert.equal(PDF_REFERENCES.length,audit.accepted.length);
 for(const ref of PDF_REFERENCES){
  const chord=parseChord(ref.symbol),found=findVoicings(ref.symbol).results.find(v=>v.frets.join()===ref.frets.join());
  assert.ok(found,ref.symbol+' '+ref.frets);assert.ok(ref.pages.length&&ref.pages.every(p=>p>=2&&p<=22));
  assert.ok(ref.frets.every(f=>f>=0&&f<=12));
  const raw=ref.frets.map((f,i)=>(f+tuning[i])%12);assert.ok(raw.every(pc=>chord.tones.some(t=>t.pc===pc)));
  const expected=referenceFingering(ref.frets,ref);assert.ok(expected);
  const plans=[found.fingering,...(found.fingering.alternatives||[])];
  assert.ok(plans.some(p=>fingerKey(p)===fingerKey(expected)),ref.symbol+' '+ref.frets+' '+ref.fingers);
 }
});
test('principais básicos seguem digitações específicas da apostila, não o mínimo de contatos',()=>{
 for(const [symbol,frets,fingers] of [
  ['C',[2,0,1,2],[2,null,1,3]],['D',[4,2,3,4],[3,1,2,4]],['E',[2,1,0,2],[2,1,null,3]],
  ['Fm',[3,1,1,3],[3,1,2,4]],['Gm',[5,3,3,5],[3,1,2,4]],['F#m',[4,2,2,4],[3,1,2,4]],
  ['C#m',[2,1,2,2],[2,1,3,4]],['A7',[2,0,2,2],[2,null,3,4]],['C7',[5,3,5,5],[2,1,3,4]],
  ['B7',[4,2,4,4],[2,1,3,4]],['C#7',[3,4,2,3],[2,4,1,3]],['E7',[2,1,3,2],[2,1,4,3]],['G7',[3,4,3,5],[1,3,2,4]]]){
  const data=findVoicings(symbol),p=selectPrimary(data.chord,data.results).shape;
  assert.deepEqual(p.frets,frets,symbol);assert.deepEqual(p.fingering.fingers,fingers,symbol);assert.equal(p.fingering.barres.length,0,symbol);
 }
});
test('formas documentadas com omissão ficam acessíveis sem exploração avançada',()=>{
 for(const [symbol,frets,missing] of [['A7',[2,0,2,2],'A'],['C7',[5,3,5,5],'C'],['C#7',[3,4,2,3],'G#']]){
  const data=findVoicings(symbol),v=data.results.find(v=>v.frets.join()===frets.join());assert.ok(v.omitted.some(t=>t.note===missing));
  assert.match(chordCards(symbol),new RegExp('data-shape="'+frets.join()+'"'));
 }
});
test('duas digitações documentadas de G#7 não viram duas posições harmônicas artificiais',()=>{
 const r=findVoicings('G#7').results.find(v=>v.frets.join()==='4,5,4,6');
 const plans=[r.fingering,...r.fingering.alternatives];assert.ok(plans.some(p=>p.fingers.join()==='1,2,1,3'));assert.ok(plans.some(p=>p.fingers.join()==='1,3,2,4'));
 assert.equal((chordCards('G#7').match(/data-shape="4,5,4,6"/g)||[]).length,1);
});
test('figuras contraditórias não entram na lista de referências aprovadas',()=>{
 assert.ok(!PDF_REFERENCES.some(r=>r.symbol==='F#m7b5'&&r.frets.join()==='3,2,1,2'));
 assert.ok(!PDF_REFERENCES.some(r=>r.symbol==='Dmaj7'));
 assert.ok(audit.rejectedOrConditional.some(r=>r.symbol==='F#m7b5'));
 const correct=findVoicings('F#m7b5').results.find(v=>v.frets.join()==='4,2,1,2');assert.ok(correct);assert.deepEqual(correct.notes,['F#','A','C','E']);
});
test('grafias da apostila têm equivalência explícita, preservando 7+ e o significado de 9',()=>{
 for(const [legacy,canonical] of [['F#m75-','F#m7b5'],['A79-','A7(b9)'],['C713-','C7(b13)'],['Gm79','Gm9'],['G713','G7(13)'],['C7/9-','C7(b9)']])assert.deepEqual(parseChord(legacy).intervals,parseChord(canonical).intervals,legacy);
 assert.equal(parseChord('C7+').quality,'maj7');assert.ok(parseChord('C9').tones.some(t=>t.degree===7));assert.ok(!parseChord('Cadd9').tones.some(t=>t.degree===7));
});
test('ordenação por registro continua respeitada nas variações documentadas e calculadas',()=>{
 for(const symbol of ['A7','G#7','Cm','Bm7'])for(const order of ['low','high']){
  const data=findVoicings(symbol,{order}),html=chordCards(symbol,{order});
  const shapes=[...html.matchAll(/data-shape="([^"]+)"/g)].map(m=>m[1]).slice(1);
  const highs=shapes.map(f=>data.results.find(v=>v.frets.join()===f).metrics.high);
  for(let i=1;i<highs.length;i++)assert.ok(order==='low'?highs[i]>=highs[i-1]:highs[i]<=highs[i-1],symbol+' '+order);
 }
});
