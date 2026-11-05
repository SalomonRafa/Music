import test from 'node:test';
import assert from 'node:assert/strict';
import {makePlan,loadState} from '../src/domain.js';
test('roteiros respeitam o orçamento em todos os tempos disponíveis',()=>{for(const minutes of [5,10,15,20,25,30])for(const goal of ['acompanhar','ritmo','fundamentos']){const p=makePlan(minutes,goal);assert.equal(p.reduce((s,x)=>s+x.minutes,0),minutes);assert.ok(p.every(x=>x.minutes>0));assert.ok(p.every(x=>x.description&&x.success));}});
test('sessão curta prioriza pulso e clareza',()=>{assert.deepEqual(makePlan(5).map(x=>x.id),['pulse','clarity']);});
test('armazenamento ausente ou inválido mantém um perfil utilizável',()=>{for(const value of [null,'{','{}','{"profile":null,"sessions":[]}']){const s=loadState({getItem:()=>value});assert.equal(s.profile.minutes,15);assert.deepEqual(s.sessions,[]);}});
test('histórico e perfil são recuperados sem perder registros',()=>{const s={profile:{name:'Rafael'},sessions:[{minutes:10}]};assert.deepEqual(loadState({getItem:()=>JSON.stringify(s)}),s);});

const {detectPitch,pitchInfo}=await import('../src/audio.js');
test('afinador estima cordas comuns em sinais senoidais isolados',()=>{for(const rate of [44100,48000])for(const hz of [196,246.94,293.66,440]){const signal=Float32Array.from({length:2048},(_,i)=>.4*Math.sin(2*Math.PI*hz*i/rate));const found=detectPitch(signal,rate);assert.ok(found);assert.ok(Math.abs(1200*Math.log2(found/hz))<12);}});
test('afinador não atribui nota ao silêncio',()=>{assert.equal(detectPitch(new Float32Array(2048),48000),null);assert.equal(pitchInfo(440).name,'Lá4');assert.equal(pitchInfo(440).cents,0);});

const {voicings,parseChord,qualities,tuning,transposeChord}=await import('../src/chords.js');
const {renderChart}=await import('../src/songbook.js');
const {estimateTriad}=await import('../src/chord-listener.js');
test('posições calculadas contêm todas e apenas as notas do acorde',()=>{for(const root of ['C','D','E','F','G','A','B'])for(const quality of Object.keys(qualities)){const symbol=root+quality,c=parseChord(symbol),expected=[...new Set(qualities[quality].intervals.map(i=>(c.root+i)%12))].sort();for(const v of voicings(symbol)){assert.deepEqual([...new Set(v.frets.map((f,i)=>(f+tuning[i])%12))].sort(),expected);assert.equal(v.bass,Math.min(...v.frets.map((f,i)=>f+tuning[i]))%12);}}});
test('inversões respeitam a altura real das cordas reentrantes',()=>{const vs=voicings('C/E');assert.ok(vs.length);assert.ok(vs.every(v=>v.bass===4));assert.equal(parseChord('H7'),null);assert.equal(parseChord('C9'),null);});
test('transposição mantém extensão e transpõe baixo',()=>{assert.equal(transposeChord('C/E',2),'D/F#');assert.equal(transposeChord('Bbmaj7',-2),'Abmaj7');assert.equal(transposeChord('Am',12),'Am');});
test('leitura escapa HTML e transpõe cifras e ChordPro',()=>{assert.ok(renderChart('[C]texto [Am]fim',2).includes('data-lookup="D"'));assert.ok(renderChart('C   G7',2).includes('data-lookup="A7"'));assert.ok(renderChart('<img src=x onerror=alert(1)>').includes('&lt;img'));assert.ok(!renderChart('{title: <script>}').includes('<script>'));});
test('detector de tríades não atribui acorde a silêncio ou uma só nota',()=>{const db=new Float32Array(4096).fill(-100);assert.equal(estimateTriad(db,48000,8192),null);const i=Math.round(440*8192/48000);db[i]=-20;assert.equal(estimateTriad(db,48000,8192),null);});
test('detector reconhece espectro idealizado de Sol maior',()=>{const db=new Float32Array(4096).fill(-100);for(const hz of [196,246.94,293.66]){const x=hz*8192/48000,center=Math.round(x);for(let i=center-1;i<=center+1;i++)db[i]=-20-12*(i-x)**2;}assert.equal(estimateTriad(db,48000,8192)?.label,'G');});

const {tuningReading}=await import('../src/audio.js');
test('afinador detecta cordas com sinal baixo, decaimento e harmônicos',()=>{for(const rate of [44100,48000])for(const hz of [196,246.94,293.66]){const signal=Float32Array.from({length:4096},(_,i)=>{const t=i/rate;return .003+.007*Math.exp(-t*5)*(Math.sin(2*Math.PI*hz*t)+.6*Math.sin(4*Math.PI*hz*t)+.25*Math.sin(6*Math.PI*hz*t));});const found=detectPitch(signal,rate);assert.ok(found);assert.ok(Math.abs(1200*Math.log2(found/hz))<4,`${hz}: ${found}`);}});
test('medidor indica direção correta em relação à corda selecionada',()=>{const hz=293.6647679;assert.equal(tuningReading(hz,'D4').state,'in');assert.equal(tuningReading(hz*2**(-20/1200),'D4').cents,-20);assert.equal(tuningReading(hz*2**(20/1200),'D4').state,'high');assert.equal(tuningReading(hz,'G3').state,'high');});
test('ruído sem periodicidade não recebe nota',()=>{let seed=42;const noise=Float32Array.from({length:4096},()=>{seed=(1664525*seed+1013904223)>>>0;return (seed/2**32-.5)*.05;});assert.equal(detectPitch(noise,48000),null);});
