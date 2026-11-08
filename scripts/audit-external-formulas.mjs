import fs from 'node:fs';
import crypto from 'node:crypto';
import {qualities,parseChord} from '../src/harmony.js';
if(!process.argv[2])throw Error('Uso: node scripts/audit-external-formulas.mjs caminho/tonal-chord-types.ts');
const external=fs.readFileSync(process.argv[2],'utf8');
const rows=[...external.matchAll(/\[\s*"([^"]+)",\s*"([^"]*)",\s*"([^"]*)"\s*,?\s*\]/g)].map(m=>({intervals:m[1],name:m[2],aliases:m[3].split(/\s+/)}));
const aliases=new Map(rows.flatMap(row=>row.aliases.map(a=>[a,row])));
const explicit={'':'M',maj7b5:'M7b5','7(13)':'7add13','m6/9':'m69','m7(11)':'m7add11','maj7(#11)':'maj7#11'};
function semitones(value){const m=/^(\d+)([PMmAd])$/.exec(value),degree=Number(m[1]),octave=Math.floor((degree-1)/7),simple=(degree-1)%7,base=[0,2,4,5,7,9,11][simple]+12*octave;return base+(m[2]==='m'?-1:m[2]==='A'?1:m[2]==='d'?([0,3,4].includes(simple)?-1:-2):0);}
const pitch=values=>[...new Set(values.map(n=>n%12))].sort((a,b)=>a-b);
const entries=Object.keys(qualities).map(quality=>{
 const alias=Object.hasOwn(explicit,quality)?explicit[quality]:quality.replace(/[(),]/g,'');
 const found=aliases.get(alias),ours=parseChord('C'+quality).tones.map(t=>t.interval),other=found?.intervals.split(' ').map(semitones);
 return {quality,label:qualities[quality].label,intervals:ours,comparisonAlias:alias,externalIntervals:other||null,status:!found?'not_found':JSON.stringify(pitch(ours))===JSON.stringify(pitch(other))?'same_pitch_classes':'different_convention',cavaquinhoFingeringReview:'pending_external_instrument_material'};
});
const result={date:'2026-11-08',scope:'Formula comparison only; does not validate cavaquinho fingerings or ergonomics.',source:{url:'https://github.com/tonaljs/tonal/blob/main/packages/chord-type/data.ts',sha256:crypto.createHash('sha256').update(external).digest('hex'),consulted:'2026-11-08'},entries};
fs.writeFileSync(new URL('../audit/chord-formula-review.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(Object.fromEntries(['same_pitch_classes','different_convention','not_found'].map(s=>[s,entries.filter(e=>e.status===s).length])));
console.log(entries.filter(e=>e.status!=='same_pitch_classes'));
