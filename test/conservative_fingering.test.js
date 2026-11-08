import test from 'node:test';
import assert from 'node:assert/strict';
import {planFingering} from '../src/fingering.js';
import {findVoicings,qualities,parseChord,chordCards} from '../src/chords.js';
import {selectPrimary} from '../src/shape-priority.js';
test('segundo print: Dm 3–2–3–3 usa quatro dedos distintos e nenhuma pestana',()=>{
 const p=planFingering([3,2,3,3]);assert.deepEqual(p.fingers,[2,1,3,4]);assert.equal(p.barres.length,0);
 const data=findVoicings('Dm'),main=selectPrimary(data.chord,data.results).shape;
 assert.deepEqual(main.frets,[3,2,3,3]);assert.deepEqual(main.notes,['F','A','D','F']);assert.deepEqual(main.fingering.fingers,[2,1,3,4]);
 assert.ok(data.results.some(v=>v.frets.join()==='7,7,6,7'));
});
test('todas as tuplas de quatro cordas até casa 12: somente indicador pode ser repetido pelo planejador',()=>{
 for(let a=-1;a<=12;a++)for(let b=-1;b<=12;b++)for(let c=-1;c<=12;c++)for(let d=-1;d<=12;d++){
  const frets=[a,b,c,d],p=planFingering(frets),pressed=frets.filter(f=>f>0);
  assert.ok(p.fingerCount<=4);
  for(const finger of [2,3,4])assert.ok(p.fingers.filter(f=>f===finger).length<=1,frets.join());
  for(const barre of p.barres){assert.equal(barre.finger,1);assert.equal(barre.fret,Math.min(...pressed));assert.ok(frets.slice(barre.from,barre.to+1).every(f=>f>=barre.fret));}
  for(let i=0;i<4;i++){if(frets[i]<=0)assert.equal(p.fingers[i],null);else assert.ok(p.contacts.some(c=>(c.mask&(1<<i))&&c.fret===frets[i]&&c.finger===p.fingers[i]));}
 }
});
test('regra se aplica a todas as famílias geradas, não apenas a Dm',()=>{
 for(const root of ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'])for(const quality of Object.keys(qualities))for(const v of findVoicings(root+quality).results){
  if(v.fingering.origin==='reference')continue;
  for(const finger of [2,3,4])assert.ok(v.fingering.fingers.filter(f=>f===finger).length<=1,root+quality+' '+v.frets);
  for(const b of v.fingering.barres)assert.equal(b.finger,1);
 }
});
test('pestanas de indicador das referências permanecem válidas',()=>{
 for(const [symbol,frets] of [['Am7',[7,5,5,5]],['Asus4',[2,2,3,2]],['C7M(b5)',[4,4,5,4]]]){
  const v=findVoicings(symbol).results.find(v=>v.frets.join()===frets.join());assert.ok(v.fingering.barres.some(b=>b.finger===1));
 }
});
test('transposição de referência não obriga a principal aguda, mas preferência pessoal é preservada',()=>{
 const cm=findVoicings('Am9'),main=selectPrimary(cm.chord,cm.results);assert.deepEqual(main.shape.frets,[5,5,0,7]);assert.ok(cm.results.some(v=>v.frets.join()==='7,5,8,9'));
 const dm=findVoicings('Dm');assert.deepEqual(selectPrimary(dm.chord,dm.results,[7,7,6,7]).shape.frets,[7,7,6,7]);
 assert.ok(chordCards('Dm').includes('data-shape="7,7,6,7"'));
});
