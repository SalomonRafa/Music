import {sortShapes} from './chord-presentation.js?v=0.13.0';
import {parseChord} from './harmony.js?v=0.13.0';
import {MAX_FRET} from './instrument.js?v=0.13.0';
// Formas das referências enviadas pelo aluno, conferidas pelas notas.
// Não é um levantamento de frequência de uso entre músicos.
export const REFERENCE_SHAPES=[
 {symbol:'Am7',frets:[7,5,5,5]}, {symbol:'Bm7',frets:[4,2,0,0]},
 {symbol:'A9',frets:[7,6,8,9]}, {symbol:'C7(13)',frets:[5,3,5,7]},
 {symbol:'Em9',frets:[2,0,3,4]}, {symbol:'Asus4',frets:[2,2,3,2]},
 {symbol:'Cmaj7b5',frets:[4,4,5,4]}
];
export function preferenceKey(chord){return `${chord.root}:${[...new Set(chord.intervals.map(i=>i%12))].sort((a,b)=>a-b).join(',')}:${chord.bass??''}`;}
export function readPrimary(storage,chord){try{const all=JSON.parse(storage.getItem('mestre-primary-shapes-v1'));const value=all?.[preferenceKey(chord)];return Array.isArray(value)&&value.length===4&&value.every(f=>Number.isInteger(f)&&f>=-1&&f<=MAX_FRET)?value:null;}catch{return null;}}
export function savePrimary(storage,chord,frets){try{let all;try{all=JSON.parse(storage.getItem('mestre-primary-shapes-v1'));}catch{}if(!all||Array.isArray(all)||typeof all!=='object')all={};if(frets===null)delete all[preferenceKey(chord)];else{if(!Array.isArray(frets)||frets.length!==4||!frets.every(f=>Number.isInteger(f)&&f>=-1&&f<=MAX_FRET))return false;all[preferenceKey(chord)]=frets;}storage.setItem('mestre-primary-shapes-v1',JSON.stringify(all));return true;}catch{return false;}}
export function selectPrimary(chord,results,preferred){
 if(!results.length)return null;const byShape=new Map(results.map(v=>[v.frets.join(),v]));
 const saved=preferred&&byShape.get(preferred.join());if(saved)return {shape:saved,type:'personal',title:'Sua forma principal',description:'Escolhida por você e salva neste navegador.'};
 const matches=[];
 for(const reference of REFERENCE_SHAPES){const source=parseChord(reference.symbol);if(source.quality!==chord.quality)continue;const delta=(chord.root-source.root+12)%12;for(const offset of [delta,delta-12]){const frets=reference.frets.map(f=>f<0?f:f+offset);if(frets.some(f=>f<0||f>MAX_FRET))continue;const shape=byShape.get(frets.join());if(shape)matches.push({shape,exact:offset===0,source:reference.symbol});}}
 matches.sort((a,b)=>Number(b.exact)-Number(a.exact)||a.shape.score-b.shape.score);
 if(matches.length){const v=matches[0];return {shape:v.shape,type:v.exact?'reference':'transposed',title:'Forma principal de referência',description:v.exact?'Forma do material enviado por você, conferida pelas notas.':`Padrão de ${v.source} transposto e conferido para este acorde. Não representa medição de popularidade.`};}
 return {shape:sortShapes([...results],'simple')[0],type:'calculated',title:'Sugestão inicial',description:preferred?'Sua principal não atende aos filtros atuais. Esta é uma alternativa calculada.':'Ainda não há forma de referência cadastrada para esta consulta. Sugestão calculada; você pode definir sua principal.'};
}
export function browserPrimary(chord){try{return readPrimary(window.localStorage,chord);}catch{return null;}}
