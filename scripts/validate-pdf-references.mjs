import fs from 'node:fs';
import {findVoicings,parseChord,tuning} from '../src/chords.js';
import {PDF_REFERENCES,PDF_SOURCE} from '../src/pdf-references.js';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
if(!process.argv[2]||!process.argv[3])throw Error('Uso: node scripts/validate-pdf-references.mjs arquivo-baseline.mjs SHA-do-baseline');
const {planFingering:before}=await import(pathToFileURL(path.resolve(process.argv[2])));
import {referenceFingering} from '../src/fingering.js';
import {selectPrimary} from '../src/shape-priority.js';
const key=p=>JSON.stringify([p.fingers,p.barres.map(b=>[b.fret,b.from,b.to,b.finger])]);
const results=PDF_REFERENCES.map(r=>{
 const data=findVoicings(r.symbol),v=data.results.find(v=>v.frets.join()===r.frets.join()),expected=referenceFingering(r.frets,r),was=before(r.frets),plans=v?[v.fingering,...v.fingering.alternatives]:[];
 return {symbol:r.symbol,literal:r.literalSymbol,frets:r.frets,fingers:r.fingers,barres:r.barres,pages:r.pages,role:r.role,notes:v?.notes,omitted:v?.omitted.map(t=>({note:t.note,degree:t.degree})),found:!!v,exactFingeringAvailable:plans.some(p=>key(p)===key(expected)),previousCalculatedFingers:was.fingers,previousNonIndexBarres:was.barres.filter(b=>b.finger!==1).map(b=>({finger:b.finger,fret:b.fret,from:b.from,to:b.to})),differentFromPreviousCalculation:key(was)!==key(expected)};
});
const summary={acceptedFingerings:results.length,chordSymbols:new Set(results.map(r=>r.symbol)).size,uniquePositions:new Set(results.map(r=>r.symbol+':'+r.frets.join())).size,allFound:results.every(r=>r.found),allExactFingeringsAvailable:results.every(r=>r.exactFingeringAvailable),differentFromPreviousCalculation:results.filter(r=>r.differentFromPreviousCalculation).length,previousNonIndexBarres:results.filter(r=>r.previousNonIndexBarres.length).length};
const output={source:PDF_SOURCE,baselineCommit:process.argv[3],summary,results};
fs.writeFileSync(new URL('../audit/pdf-sequencias-validation.json',import.meta.url),JSON.stringify(output,null,2)+'\n');console.log(summary);
if(!summary.allFound||!summary.allExactFingeringsAvailable)process.exitCode=1;
