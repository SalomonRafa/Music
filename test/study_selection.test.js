import test from 'node:test';
import assert from 'node:assert/strict';
import {chordCards,findVoicings,parseChord,qualities} from '../src/chords.js';
import {selectStudyShapes,studyCandidates} from '../src/chord-presentation.js';
import {proposeArrangement} from '../src/song-arrangement.js';
const shapes=html=>[...html.matchAll(/data-shape="([^"]+)"/g)].map(m=>m[1]);
test('consulta normal de todas as famílias oferece no máximo uma principal e três alternativas',()=>{
 for(const root of ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'])for(const quality of Object.keys(qualities)){
  const html=chordCards(root+quality),cards=shapes(html);
  assert.ok(cards.length<=4,root+quality);assert.equal(new Set(cards).size,cards.length);
  assert.ok(!html.includes('Mostrar todas as'));assert.ok(!html.includes('combinações calculadas'));
 }
});
test('Eb9 e Bbm6 têm seleção útil de quatro cordas, não o total da enumeração',()=>{
 for(const symbol of ['Eb7(9)','Bbm6']){
  const raw=findVoicings(symbol),html=chordCards(symbol),shown=shapes(html);
  assert.ok(raw.results.length>shown.length);assert.ok(shown.length>=2&&shown.length<=4);
  for(const frets of shown){const v=raw.results.find(v=>v.frets.join()===frets);assert.ok(v.frets.every(f=>f>=0));}
 }
 assert.ok(shapes(chordCards('Bbm6')).includes('3,3,2,5'));
 assert.ok(shapes(chordCards('Eb9')).includes('3,3,2,5'));
});
test('não inventa alternativas para preencher quatro cartões e evita região/função repetida',()=>{
 const r=findVoicings('Bbm6'),pool=studyCandidates(r.results),selected=selectStudyShapes(r.results,pool[0]);
 assert.ok(selected.length<4);
 const signatures=selected.map(v=>Math.floor(Math.min(...v.frets.filter(f=>f>0))/3)+':'+v.omitted.some(t=>t.degree===1));assert.equal(new Set(signatures).size,signatures.length);
});
test('busca avançada é explícita, paginada e não tem mostrar todas',()=>{
 const html=chordCards('Eb9',{explore:true});assert.match(html,/Pesquisa avançada/);
 assert.ok(shapes(html).length<=13);assert.ok(shapes(html).length>4);assert.match(html,/Mais posições/);assert.ok(!html.includes('Mostrar todas as'));
});
test('escolha pessoal e busca por casas não são apagadas pela seleção de estudo',()=>{
 const html=chordCards('Bbm6',{preferredFrets:[8,6,8,5]});assert.equal(shapes(html)[0],'8,6,8,5');assert.ok(shapes(html).length<=4);
 const queried=chordCards('Bbm6',{position:'8–6–8–5'});assert.deepEqual(shapes(queried),['8,6,8,5']);assert.match(queried,/Omitidas: F \(5\)/);
});
test('formas da adaptação de música também priorizam quatro cordas e menor omissão',()=>{
 for(const c of proposeArrangement(['Eb9','Bbm6','Am'],'low').choices){const pool=studyCandidates(findVoicings(c.symbol).results);assert.ok(pool.some(v=>v.frets.join()===c.shape.frets.join()));}
});
