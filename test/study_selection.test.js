import test from 'node:test';
import assert from 'node:assert/strict';
import {chordCards,findVoicings,qualities} from '../src/chords.js';
import {selectStudyShapes,studyCandidates} from '../src/chord-presentation.js';
import {proposeArrangement} from '../src/song-arrangement.js';
const shapes=html=>[...html.matchAll(/data-shape="([^"]+)"/g)].map(m=>m[1]);
test('todas as formas práticas permanecem na consulta normal em todas as famílias',()=>{
 for(const root of ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'])for(const quality of Object.keys(qualities)){
  const symbol=root+quality,expected=studyCandidates(findVoicings(symbol).results).map(v=>v.frets.join()),html=chordCards(symbol),cards=shapes(html);
  for(const frets of expected)assert.ok(cards.includes(frets),symbol+': '+frets);
  assert.equal(new Set(cards).size,cards.length);assert.ok(!html.includes('Mostrar todas as'));assert.ok(!html.includes('combinações calculadas'));
 }
});
test('Bbm recupera as cinco formas completas, inclusive duas da mesma região',()=>{
 const expected=['3,3,2,3','8,6,6,8','11,10,11,11','8,10,11,11','11,10,11,8'];
 assert.deepEqual(shapes(chordCards('Bbm')).sort(),expected.sort());
 assert.ok(!chordCards('Bbm').includes('more-chord-shapes'));
});
test('Eb9 mantém dez formas de quatro cordas e Bbm6 mantém seis, sem as reduções adicionais',()=>{
 for(const [symbol,count] of [['Eb7(9)',10],['Bbm6',6]]){
  const raw=findVoicings(symbol),shown=shapes(chordCards(symbol));assert.equal(shown.length,count);
  for(const frets of shown){const v=raw.results.find(v=>v.frets.join()===frets);assert.ok(v.frets.every(f=>f>=0));assert.equal(v.omitted.length,symbol==='Bbm6'?0:1);}
 }
 assert.match(chordCards('Eb9'),/Mais formas do acorde \(4\)/);
});
test('não agrupa desenhos diferentes pela região ou pela função',()=>{
 const r=findVoicings('Bbm6'),pool=studyCandidates(r.results),selected=selectStudyShapes(r.results,pool[0]);
 assert.deepEqual(selected.map(v=>v.frets.join()).sort(),pool.map(v=>v.frets.join()).sort());
});
test('busca avançada continua explícita e paginada',()=>{
 const html=chordCards('Eb9',{explore:true});assert.match(html,/Pesquisa avançada/);assert.ok(shapes(html).length<=13);assert.match(html,/Mais posições/);
});
test('escolha pessoal e busca por casas permanecem acessíveis',()=>{
 assert.equal(shapes(chordCards('Bbm6',{preferredFrets:[8,6,8,5]}))[0],'8,6,8,5');
 const queried=chordCards('Bbm6',{position:'8–6–8–5'});assert.deepEqual(shapes(queried),['8,6,8,5']);assert.match(queried,/Omitidas: F \(5\)/);
});
test('adaptação de música prioriza quatro cordas e menor omissão',()=>{
 for(const c of proposeArrangement(['Eb9','Bbm6','Am'],'low').choices)assert.ok(studyCandidates(findVoicings(c.symbol).results).some(v=>v.frets.join()===c.shape.frets.join()));
});
