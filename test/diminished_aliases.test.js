import test from 'node:test';
import assert from 'node:assert/strict';
import {parseChord,findVoicings,transposeChord,chordCards,diminishedNotation} from '../src/chords.js';
import {renderChart} from '../src/songbook.js';
const roots=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
test('º, ° e círculos equivalentes reconhecidos em todas as fundamentais sem mudar a fórmula',()=>{
 for(const root of roots)for(const mark of ['°','º','ᵒ','˚']){
  assert.deepEqual(parseChord(root+mark).intervals,[0,3,6],root+mark);
  assert.deepEqual(parseChord(root+mark+'7').intervals,[0,3,6,9],root+mark+'7');
  assert.ok(findVoicings(root+mark).results.length);
 }
 assert.deepEqual(parseChord('C#o').intervals,[0,3,6]);assert.deepEqual(parseChord('C#o7').intervals,[0,3,6,9]);
});
test('C#º e C#° têm as mesmas posições; dim7 é outra fórmula',()=>{
 assert.deepEqual(findVoicings('C#º').results.map(v=>v.frets),findVoicings('C#dim').results.map(v=>v.frets));
 assert.deepEqual(parseChord('C#dim7').tones.map(t=>t.note),['C#','E','G','Bb']);
 assert.ok(findVoicings('C#dim7').results.some(v=>v.frets.join()==='2,3,2,5'));
 assert.ok(!findVoicings('C#dim').results.some(v=>v.frets.join()==='2,3,2,5'));
});
test('círculo sem sétima oferece escolha explícita, sem reescrever cifras antigas',()=>{
 assert.deepEqual(diminishedNotation('C#º'),{triad:'C#dim',seventh:'C#dim7',ambiguous:true});
 assert.match(chordCards('C#º'),/data-chord-example="C#dim7"/);
 assert.equal(parseChord('C#°').quality,'dim');assert.equal(diminishedNotation('C#º7').ambiguous,false);
 assert.ok(!chordCards('C#dim7').includes('diminished-choice'));
 assert.match(chordCards('C#º',{selectionAction:'song'}),/escreva C#dim7 no editor/);
 assert.ok(!chordCards('C#º',{selectionAction:'song'}).includes('data-chord-example="C#dim7"'));
});
test('cifras, nomes em português e transposição mantêm o tipo do diminuto',()=>{
 assert.equal(parseChord('Dó#º').canonical,'C#dim');
 assert.equal(parseChord('Do').canonical,'C');assert.equal(parseChord('Do7').canonical,'C7');
 assert.match(renderChart('F | C7 | C#º | Dm'),/data-lookup="C#°"/);
 assert.match(renderChart('[C#º7]trecho',2),/data-lookup="Eb°7"/);
 assert.equal(parseChord(transposeChord('C#º/E',2)).quality,'dim');
 assert.equal(parseChord(transposeChord('C#º7',2)).quality,'dim7');
});
test('não confunde meio-diminuto, zero ou símbolo inválido com diminuto',()=>{
 assert.deepEqual(parseChord('C#ø').intervals,[0,3,6,10]);assert.equal(diminishedNotation('C#ø'),null);
 for(const s of ['C#0','C#ºº','C#overture'])assert.equal(parseChord(s),null,s);
});
