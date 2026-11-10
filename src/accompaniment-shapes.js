import {parseChord} from './harmony.js?v=0.19.0';
import {referenceFingering} from './fingering.js?v=0.19.0';
import {shapeMetrics} from './chord-presentation.js?v=0.19.0';
import {STRINGS,MAX_FRET} from './instrument.js?v=0.19.0';
// Contextual voicings do not change the slash-bass constraint of findVoicings.
// Here G is supplied by the ensemble; F is the lowest note of the cavaquinho.
const videoDm7G={symbol:'Dm7/G',frets:[3,5,3,5],fingers:[1,3,1,4],barres:[{fret:3,from:0,to:3,finger:1}],source:'Gravação enviada de Voo pro Japão · passagem para Dm7/G, 0:18',evidenceNote:'Leitura audiovisual do trecho: F–C–D–G. A quinta A é omitida. Para corresponder à cifra, o Sol grave deve vir do acompanhamento; o cavaquinho tem F como nota mais grave.'};
export function accompanimentShape(symbol,frets=null,settings={}){
 const chord=parseChord(symbol),ref=parseChord(videoDm7G.symbol);
 if(!chord||chord.root!==ref.root||chord.quality!==ref.quality||chord.bass!==ref.bass)return null;
 if(frets&&frets.join()!==videoDm7G.frets.join())return null;
 const f=[...videoDm7G.frets];
 if(f.some(n=>n<Number(settings.minFret??0)||n>Math.min(MAX_FRET,Number(settings.maxFret??MAX_FRET)))||Math.max(...f)-Math.min(...f)>=Number(settings.maxSpan??5))return null;
 const tuning=STRINGS.map(s=>s.midi),midi=f.map((n,i)=>n+tuning[i]),played=new Set(midi.map(n=>n%12));
 const omitted=chord.tones.filter(t=>!played.has(t.pc));
 if(settings.allowOmissions===false&&omitted.length||settings.rootPresence==='absent'||settings.allowRootless===false&&omitted.some(t=>t.degree===1))return null;
 const fingering={...referenceFingering(f,videoDm7G),referenceKind:'video',evidenceNote:videoDm7G.evidenceNote};
 const metrics=shapeMetrics(f,tuning,fingering),spelling=new Map(chord.tones.map(t=>[t.pc,t.note]));spelling.set(chord.bass,chord.bassName);
 return {frets:f,bass:Math.min(...midi)%12,fingering,metrics,notes:midi.map(n=>spelling.get(n%12)),omitted,score:metrics.difficulty,requiresExternalBass:true,externalBass:chord.bassName};
}
