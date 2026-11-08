import test from 'node:test';
import assert from 'node:assert/strict';
import {findVoicings,parseChord,qualities,tuning,chordCards,chordsPage} from '../src/chords.js';
// Independent oracle: enumerate every physical tuple first, rather than derive
// per-string options from the production engine's harmonic variants.
const physical=new Map();
for(let a=-1;a<=12;a++)for(let b=-1;b<=12;b++)for(let c=-1;c<=12;c++)for(let d=-1;d<=12;d++){
 const frets=[a,b,c,d],pressed=frets.filter(f=>f>0);
 if(pressed.length&&Math.max(...pressed)-Math.min(...pressed)>4)continue;
 const notes=frets.flatMap((f,i)=>f<0?[]:[(f+tuning[i])%12]);if(notes.length<2)continue;
 const mask=notes.reduce((m,n)=>m|1<<n,0);if(!physical.has(mask))physical.set(mask,[]);physical.get(mask).push(frets.join());
}
const bits=n=>n.toString(2).replace(/0/g,'').length;
test('auditoria exaustiva: todas as tuplas admitidas em 12 notas e todas as famílias cadastradas',()=>{
 for(const root of ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'])for(const quality of Object.keys(qualities)){
  const symbol=root+quality,chord=parseChord(symbol),full=chord.tones.reduce((m,t)=>m|1<<t.pc,0),highest=Math.max(...chord.tones.map(t=>t.degree));
  let required=0;
  for(const t of chord.tones){const optional=(t.degree===1)||(t.degree===5&&t.interval===7)||(t.degree===9&&t.interval===14&&highest>9)||(t.degree===11&&t.interval===17&&highest>11);if(!optional||t.degree===2||t.degree===4)required|=1<<t.pc;}
  const expected=[];
  for(const [mask,shapes] of physical)if((mask&full)===mask&&(mask&required)===required&&bits(mask)>=Math.min(3,bits(full)))expected.push(...shapes);
  const actual=findVoicings(symbol).results.map(v=>v.frets.join());
  assert.deepEqual(actual.sort(),expected.sort(),symbol);
 }
});
test('sétimas admitem quinta omitida e nota dobrada nas 12 fundamentais',()=>{
 const base=[2,3,1,2]; // C7: E Bb C E; sem G.
 for(let delta=0;delta<12;delta++){
  const symbol=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][delta]+'7';
  assert.ok(findVoicings(symbol).results.some(v=>v.omitted.length===1&&v.omitted[0].degree===5&&v.frets.every(f=>f>=0)),symbol);
  const frets=base.map(f=>f+delta);if(frets.some(f=>f>12))continue;
  const shape=findVoicings(symbol).results.find(v=>v.frets.join()===frets.join());assert.ok(shape,symbol);assert.deepEqual(shape.omitted.map(t=>t.degree),[5]);
  assert.ok(!findVoicings(symbol,{allowOmissions:false}).results.some(v=>v.frets.join()===frets.join()));
 }
});
test('Bbm completo em duas regiões e sem omissões de notas',()=>{
 const r=findVoicings('Bbm');assert.deepEqual(r.results[0].frets,[3,3,2,3]);
 for(const frets of [[3,3,2,3],[8,6,6,8]]){const v=r.results.find(v=>v.frets.join()===frets.join());assert.ok(v);assert.equal(v.omitted.length,0);assert.ok(chordCards('Bbm',{position:frets.join('–')}).includes(`data-shape="${frets.join()}"`));}
 assert.match(chordCards('Bbm',{position:'3-3-3-3'}),/não corresponde/);
 assert.match(chordCards('Bbm',{position:'14-14-14-14'}),/de 0 a 12/);
});
test('Ponta de dor: todas as cifras do print reconhecidas, inclusive Fm7M',()=>{
 for(const symbol of ['Fm','Fm7M','Fm7','F7','Bbm','Eb7','Ab','Db','Gm7(b5)','C7']){const r=findVoicings(symbol);assert.ok(r.chord&&r.results.length,symbol);}
 assert.deepEqual(parseChord('Fm7M').tones.map(t=>t.note),['F','Ab','C','E']);
});
test('ajuda longa recolhida e sem botão para despejar todas as combinações',()=>{
 const page=chordsPage();assert.ok(!page.includes('Seu cavaquinho: 12 trastes'));assert.match(page,/<details class="chord-help"><summary>Como ler/);assert.ok(!page.includes('<details class="chord-help" open'));
 assert.ok(!chordCards('C7').includes('Mostrar todas as'));
});

test('print aos 0:17 indica Bbm6, que contém Sol e não se confunde com Bbm',()=>{
 const minor=parseChord('Bbm'),sixth=parseChord('Bbm6');
 assert.deepEqual(sixth.tones.map(t=>t.note),['Bb','Db','F','G']);
 assert.ok(!minor.tones.some(t=>t.pc===7));
 const shape=findVoicings('Bbm6').results.find(v=>v.frets.join()==='3,3,2,5');
 assert.ok(shape);assert.deepEqual(shape.notes,['F','Bb','Db','G']);assert.equal(shape.omitted.length,0);
 assert.ok(!findVoicings('Bbm').results.some(v=>v.frets.join()==='3,3,2,5'));
});

test('mesmo desenho é Bbm6 completo e Eb9 sem fundamental; Am na quinta casa permanece distinto',async()=>{
 const {equivalentShapeReading}=await import('../src/chords.js');
 const a=findVoicings('Bbm6'),b=findVoicings('Eb7/9');
 const left=a.results.find(v=>v.frets.join()==='3,3,2,5'),right=b.results.find(v=>v.frets.join()==='3,3,2,5');
 assert.ok(left&&right);assert.deepEqual(left.notes,right.notes);assert.deepEqual(right.omitted.map(t=>t.note),['Eb']);
 assert.match(equivalentShapeReading(left,a.chord),/Eb9 sem fundamental/);
 assert.match(equivalentShapeReading(right,b.chord),/Bbm6/);
 const am=findVoicings('Am').results.find(v=>v.frets.join()==='7,5,5,7');
 assert.ok(am);assert.deepEqual(am.notes,['A','C','E','A']);
});
