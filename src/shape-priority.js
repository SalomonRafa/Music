import {PDF_REFERENCES} from './pdf-references.js?v=0.18.2';
import {referenceFingering} from './fingering.js?v=0.18.2';
import {sortShapes} from './chord-presentation.js?v=0.18.2';
import {parseChord} from './harmony.js?v=0.18.2';
import {MAX_FRET} from './instrument.js?v=0.18.2';
// Referências enviadas pelo aluno e padrões móveis calculados identificados por origin.
// Não é um levantamento de frequência de uso entre músicos.
export const REFERENCE_SHAPES=[
 {symbol:'Dm',frets:[3,2,3,3],fingers:[2,1,3,4],barres:[],source:'Imagem de Dm enviada pelo aluno'},
 {symbol:'Bbm',frets:[3,3,2,3],fingers:[2,3,1,4],barres:[],source:'Casa de Bamba — imagem enviada pelo aluno'},
 {symbol:'Am7',frets:[7,5,5,5],fingers:[3,1,1,1],barres:[{fret:5,from:0,to:3,finger:1}]},
 {symbol:'Am7',frets:[5,5,5,5],fingers:[1,1,1,1],barres:[{fret:5,from:0,to:3,finger:1}],role:'alternative',referenceKind:'reviewed',source:'Forma reduzida de acompanhamento: G–C–E–G, sem a fundamental A',evidenceNote:'Pestana completa na casa 5. As notas também formam C/G; a leitura como Am7 depende do baixo e do contexto.'}, {symbol:'Bm7',frets:[4,2,0,0]},
 {symbol:'A9',frets:[7,6,8,9]}, {symbol:'C7(13)',frets:[5,3,5,7]},
 {symbol:'Em9',frets:[2,0,3,4]}, {symbol:'Asus4',frets:[2,2,3,2]},
 {symbol:'Cmaj7b5',frets:[4,4,5,4]}
];
const ALL_REFERENCES=[...REFERENCE_SHAPES,...PDF_REFERENCES];
export function preferenceKey(chord){return `${chord.root}:${[...new Set(chord.intervals.map(i=>i%12))].sort((a,b)=>a-b).join(',')}:${chord.bass??''}`;}
export function readPrimary(storage,chord){try{const all=JSON.parse(storage.getItem('mestre-primary-shapes-v1'));const value=all?.[preferenceKey(chord)];return Array.isArray(value)&&value.length===4&&value.every(f=>Number.isInteger(f)&&f>=-1&&f<=MAX_FRET)?value:null;}catch{return null;}}
export function savePrimary(storage,chord,frets){try{let all;try{all=JSON.parse(storage.getItem('mestre-primary-shapes-v1'));}catch{}if(!all||Array.isArray(all)||typeof all!=='object')all={};if(frets===null)delete all[preferenceKey(chord)];else{if(!Array.isArray(frets)||frets.length!==4||!frets.every(f=>Number.isInteger(f)&&f>=-1&&f<=MAX_FRET))return false;all[preferenceKey(chord)]=frets;}storage.setItem('mestre-primary-shapes-v1',JSON.stringify(all));return true;}catch{return false;}}
export function selectPrimary(chord,results,preferred){
 if(!results.length)return null;const byShape=new Map(results.map(v=>[v.frets.join(),v]));
 const saved=preferred&&byShape.get(preferred.join());if(saved)return {shape:saved,type:'personal',title:'Sua forma principal',description:'Escolhida por você e salva neste navegador.'};
 const matches=[];
 for(const reference of ALL_REFERENCES){const source=parseChord(reference.symbol);if(source.quality!==chord.quality)continue;const delta=(chord.root-source.root+12)%12;for(const offset of [delta,delta-12]){const frets=reference.frets.map(f=>f<0?f:f+offset);if(frets.some(f=>f<0||f>MAX_FRET))continue;const shape=byShape.get(frets.join());if(shape)matches.push({shape,exact:offset===0,source:reference.symbol,origin:reference.origin,priority:reference.referenceKind==='pdf'?1:0,referenceKind:reference.referenceKind,rolePriority:reference.role==='alternative'?1:0});}}
 matches.sort((a,b)=>Number(b.exact)-Number(a.exact)||a.priority-b.priority||a.rolePriority-b.rolePriority||a.shape.score-b.shape.score);
 const exact=matches.find(v=>v.exact);
 if(exact)return {shape:exact.shape,type:'reference',title:'Forma principal de referência',description:exact.referenceKind==='pdf'?'Forma conferida na apostila enviada; a origem e as omissões estão nos detalhes.':'Forma do material enviado por você, conferida pelas notas.'};
 // A transposed pattern is an available fingering, not an automatic principal.
 const simplest=sortShapes([...results],'simple')[0],transposed=matches.find(v=>v.shape===simplest);
 if(transposed)return {shape:simplest,type:'transposed',title:'Sugestão inicial',description:`Padrão de ${transposed.source} transposto; escolhido por também atender à ordenação por simplicidade.`};
 return {shape:sortShapes([...results],'simple')[0],type:'calculated',title:'Sugestão inicial',description:preferred?'Sua principal não atende aos filtros atuais. Esta é uma alternativa calculada.':'Ainda não há forma de referência cadastrada para esta consulta. Sugestão calculada; você pode definir sua principal.'};
}
export function browserPrimary(chord){try{return readPrimary(window.localStorage,chord);}catch{return null;}}

// Precompute documented fingerings once; do not parse the whole book per position.
const FINGERING_INDEX=new Map();
for(const reference of ALL_REFERENCES){
 if(!reference.fingers)continue;
 const source=parseChord(reference.symbol);
 for(let root=0;root<12;root++){
  const delta=(root-source.root+12)%12;
  for(const offset of [delta,delta-12]){
   const moved=reference.frets.map(f=>f<0?f:f+offset);
   if(moved.some((f,i)=>f>MAX_FRET||(reference.frets[i]>=0&&f<0)))continue;
   const plan=referenceFingering(moved,reference);if(!plan)continue;
   const key=`${source.quality}:${root}:${moved.join()}`;
   if(!FINGERING_INDEX.has(key))FINGERING_INDEX.set(key,[]);
   FINGERING_INDEX.get(key).push({...plan,transposed:offset!==0,referenceKind:reference.referenceKind||'user',evidenceNote:[reference.evidenceNote,reference.selectionNote].filter(Boolean).join(' '),priority:reference.referenceKind==='pdf'?1:0});
  }
 }
}
for(const [key,matches]of FINGERING_INDEX){
 matches.sort((a,b)=>Number(a.transposed)-Number(b.transposed)||a.priority-b.priority);
 const seen=new Set(),unique=matches.filter(p=>{const sig=JSON.stringify([p.fingers,p.barres.map(b=>[b.fret,b.from,b.to,b.finger])]);if(seen.has(sig))return false;seen.add(sig);return true;});
 FINGERING_INDEX.set(key,{...unique[0],alternatives:unique.slice(1)});
}
export function findReferenceFingering(chord,frets){return FINGERING_INDEX.get(`${chord.quality}:${chord.root}:${frets.join()}`)||null;}
