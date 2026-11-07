import {extractChartChords} from './chart-parser.js?v=0.14.0';
import {findVoicings,parseChord} from './chords.js?v=0.14.0';
import {preferenceKey,selectPrimary,browserPrimary} from './shape-priority.js?v=0.14.0';
export const extractSongChords=extractChartChords;
export function songShapeKey(symbol,steps=0){const chord=parseChord(symbol);return chord?`${steps}:${preferenceKey(chord)}`:null;}
export function resolveSongShape(symbol,arrangement={},steps=0){const data=findVoicings(symbol),key=songShapeKey(symbol,steps),saved=arrangement.shapes?.[key];const selected=selectPrimary(data.chord,data.results,saved||browserPrimary(data.chord));return {data,key,shape:selected?.shape||null,explicit:!!saved&&!!selected&&selected.type==='personal'};}
export function proposeArrangement(symbols,style='low'){
 const issues=[],rows=[],seen=new Set();for(const symbol of symbols){const data=findVoicings(symbol);if(!data.chord||!data.results.length){issues.push({symbol,reason:data.reason});continue;}const key=preferenceKey(data.chord);if(seen.has(key))continue;seen.add(key);const rooted=data.results.filter(v=>!v.omitted.some(t=>t.degree===1)),pool=rooted.length?rooted:data.results;const cost=v=>style==='simple'?v.metrics.difficulty:v.metrics.high*4+v.metrics.spread*7+v.fingering.fingerCount*5+Math.max(...v.frets)*2;
 rows.push({symbol,chord:data.chord,candidates:[...pool].sort((a,b)=>cost(a)-cost(b)).slice(0,12),cost});}
 if(!rows.length)return {choices:[],issues};
 const layers=[];for(let i=0;i<rows.length;i++){const row=rows[i],prev=layers[i-1];layers.push(row.candidates.map(shape=>{let best={cost:row.cost(shape),previous:-1};if(prev){best={cost:Infinity,previous:-1};prev.forEach((p,j)=>{const distance=Math.abs(shape.metrics.mean-p.shape.metrics.mean)*2+Math.abs(Math.max(...shape.frets)-Math.max(...p.shape.frets))*3;const total=p.cost+row.cost(shape)+distance;if(total<best.cost)best={cost:total,previous:j};});}return {...best,shape};}));}
 let index=layers.at(-1).reduce((best,p,i,a)=>p.cost<a[best].cost?i:best,0);const chosen=[];for(let i=layers.length-1;i>=0;i--){const node=layers[i][index];chosen.unshift({symbol:rows[i].symbol,shape:node.shape});index=node.previous;}
 return {choices:chosen,issues};
}
