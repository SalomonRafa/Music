import test from 'node:test';
import assert from 'node:assert/strict';
import {accompanimentShape} from '../src/accompaniment-shapes.js';
import {findVoicings,chordCards} from '../src/chords.js';
import {songShapeKey,resolveSongShape} from '../src/song-arrangement.js';
import {applyVooVideoDm7G,vooProJapao} from '../src/repertoire-update.js';
test('Dm7/G do acompanhamento distingue notas do cavaco e baixo externo',()=>{
 const v=accompanimentShape('Dm7/G');
 assert.deepEqual(v.frets,[3,5,3,5]);assert.deepEqual(v.notes,['F','C','D','G']);assert.deepEqual(v.fingering.fingers,[1,3,1,4]);assert.equal(v.bass,5);assert.equal(v.externalBass,'G');assert.deepEqual(v.omitted.map(t=>t.note),['A']);assert.equal(v.fingering.barres[0].fret,3);
 assert.equal(accompanimentShape('Dm7'),null);assert.equal(accompanimentShape('Dm7/A'),null);assert.equal(accompanimentShape('Dm7/G',null,{allowOmissions:false}),null);assert.equal(accompanimentShape('Dm7/G',null,{maxFret:4}),null);
 // Strict solo voicings continue to obey the requested lowest pitch.
 assert.ok(findVoicings('Dm7/G').results.every(v=>v.bass===7));
 assert.ok(!findVoicings('Dm7/G').results.some(v=>v.frets.join()==='3,5,3,5'));
 const html=chordCards('Dm7/G');assert.equal((html.match(/data-shape="3,5,3,5"/g)||[]).length,1);assert.match(html,/Baixo G no acompanhamento/);
});
test('forma contextual funciona na cifra e como escolha pessoal',()=>{
 const key=songShapeKey('Dm7/G'),a={shapes:{[key]:[3,5,3,5]},transpose:0};
 const r=resolveSongShape('Dm7/G',a);assert.equal(r.explicit,true);assert.deepEqual(r.shape.frets,[3,5,3,5]);assert.equal(r.shape.requiresExternalBass,true);
 const html=chordCards('Dm7/G',{preferredFrets:[3,5,3,5],selectionAction:'song',songChoice:true});assert.match(html,/primary-shape[^>]*data-shape="3,5,3,5"/);assert.match(html,/Baixo G no acompanhamento/);
 assert.notDeepEqual(resolveSongShape('Dm7/G',a,1).shape.frets,[3,5,3,5]);
});
test('migração só altera a posição de Dm7/G nesta música, com backup e sem repetição',()=>{
 const original={...vooProJapao,videoDm7GApplied:false,text:'[Dm7/G]Letra e anotação pessoal',arrangement:{shapes:{other:[3,2,3,3]},transpose:2}};
 const another={id:'other',text:'Outra música'};
 const m=new Map([['mestre-songbook-v1',JSON.stringify([original,another])]]),s={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};
 assert.equal(applyVooVideoDm7G(s),true);assert.equal(applyVooVideoDm7G(s),false);
 const songs=JSON.parse(s.getItem('mestre-songbook-v1'));assert.equal(songs[0].text,original.text);assert.equal(songs[0].arrangement.transpose,2);assert.deepEqual(songs[0].arrangement.shapes.other,[3,2,3,3]);assert.deepEqual(songs[0].arrangement.shapes[songShapeKey('Bb7M')],[3,3,3,7]);assert.deepEqual(songs[0].arrangement.shapes[songShapeKey('Dm7/G')],[3,5,3,5]);assert.deepEqual(songs[1],another);assert.deepEqual(JSON.parse(s.getItem('mestre-song-backup-voo-pro-japao-before-video-dm7g-v1')),original);
});
