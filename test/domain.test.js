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
test('medidor indica direção correta em relação à corda selecionada',()=>{const hz=293.6647679;assert.equal(tuningReading(hz,'D4').state,'in');assert.equal(tuningReading(hz*2**(-20/1200),'D4').cents,-20);assert.equal(tuningReading(hz*2**(20/1200),'D4').state,'high');assert.equal(tuningReading(hz,'G3').state,'uncertain');});
test('ruído sem periodicidade não recebe nota',()=>{let seed=42;const noise=Float32Array.from({length:4096},()=>{seed=(1664525*seed+1013904223)>>>0;return (seed/2**32-.5)*.05;});assert.equal(detectPitch(noise,48000),null);});

const {createPitchTracker}=await import('../src/audio.js');
test('ponteiro preserva leitura por até 2,5 s e distingue valor retido de nova medição',()=>{const t=createPitchTracker();assert.equal(t.update(null,0),null);assert.equal(t.update(293.66,100).held,false);assert.equal(t.update(null,500).held,true);assert.equal(t.update(null,2000).hz,293.66);assert.equal(t.update(null,2600),null);});
test('falha breve e um harmônico isolado não apagam nem deslocam a leitura',()=>{const t=createPitchTracker();t.update(293.66,0);assert.equal(t.update(null,100).hz,293.66);assert.equal(t.update(587.32,200).hz,293.66);assert.equal(t.update(293.66,300).held,false);t.reset();assert.equal(t.update(null,400),null);});
test('uma nova nota consistente substitui a anterior',()=>{const t=createPitchTracker();t.update(293.66,0);t.update(246.94,100);assert.equal(t.update(246.94,200).hz,246.94);});
test('nota continua detectável durante o decaimento abaixo do limiar antigo',()=>{for(const amplitude of [.01,.004,.001]){const x=Float32Array.from({length:4096},(_,i)=>amplitude*Math.sin(2*Math.PI*293.66*i/48000));const hz=detectPitch(x,48000);assert.ok(hz);assert.ok(Math.abs(1200*Math.log2(hz/293.66))<3);}});


test('harmônicos dominantes não devem substituir a fundamental',()=>{for(const rate of [44100,48000])for(const hz of [196,246.94,293.66])for(const strength of [.3,.1,.03]){const x=Float32Array.from({length:4096},(_,i)=>{const t=i/rate;return .05*(strength*Math.sin(2*Math.PI*hz*t)+Math.sin(4*Math.PI*hz*t)+.5*Math.sin(6*Math.PI*hz*t));});const found=detectPitch(x,rate);assert.ok(found);assert.ok(Math.abs(1200*Math.log2(found/hz))<3,`${hz}: ${found}`);}});
test('modo cavaquinho sugere corda sem confundir Ré4 com uma corda única',()=>{assert.equal(tuningReading(196).target,'Sol3 · 3ª corda');assert.equal(tuningReading(246.94).target,'Si3 · 2ª corda');assert.equal(tuningReading(293.66).target,'Ré4 · 1ª ou 4ª corda');assert.equal(tuningReading(293.66,'D4-4').target,'Ré4 · 4ª corda');});
test('possível oitava ou nota distante não recebe orientação para girar tarraxa',()=>{for(const hz of [146.83,587.32,880])assert.equal(tuningReading(hz,'D4-4').state,'uncertain');assert.equal(tuningReading(440,'cavaquinho').state,'uncertain');});
test('verde depende de sequência estável e não de um único quadro',()=>{const t=createPitchTracker();assert.equal(t.update(293.66,0).stable,false);t.update(293.7,100);t.update(293.6,200);assert.equal(t.update(293.65,300).stable,true);});

const {measurePitch}=await import('../src/audio.js');
test('frequências detunadas produzem desvio correto sem induzir a nota-alvo',()=>{for(const rate of [44100,48000])for(const [target,hz] of [['D4-1',293.6647679],['G3',195.997718],['B3',246.9416506]])for(const cents of [-45,-20,-7,0,7,20,45]){const input=hz*2**(cents/1200),x=Float32Array.from({length:4096},(_,i)=>{const t=i/rate;return .04*(Math.sin(2*Math.PI*input*t)+.8*Math.sin(4*Math.PI*input*t)+.3*Math.sin(6*Math.PI*input*t));});const reading=measurePitch(x,rate);assert.ok(reading.hz,`${input}: ${JSON.stringify(reading)}`);const p=tuningReading(reading.hz,target);assert.ok(Math.abs(p.cents-cents)<=1,`${target} ${cents}: ${p.cents}`);assert.equal(p.state,Math.abs(cents)<=5?'in':cents<0?'low':'high');}});
