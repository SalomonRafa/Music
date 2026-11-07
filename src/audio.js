import {STRINGS} from './instrument.js?v=0.14.0';
import {estimateTriad} from './chord-listener.js?v=0.14.0';
// YIN: diferença normalizada, primeira periodicidade consistente e interpolação subamostra.
export function detectPitch(data, rate) {
 let mean=0;for(const x of data)mean+=x;mean/=data.length;
 let power=0;for(const x of data)power+=(x-mean)**2;
 if(Math.sqrt(power/data.length)<.0005)return null;
 const min=Math.max(2,Math.floor(rate/1000)),max=Math.min(Math.ceil(rate/100),Math.floor(data.length/2)-1);
 const size=data.length-max,diff=new Float64Array(max+1);let sum=0;
 for(let lag=1;lag<=max;lag++){let d=0;for(let i=0;i<size;i++){const delta=data[i]-data[i+lag];d+=delta*delta;}sum+=d;diff[lag]=sum?d*lag/sum:1;}
 // Compare mínimos posteriores antes de aceitar um período curto dominado por harmônicos.
 const minima=[];
 for(let k=min+1;k<max;k++)if(diff[k]<.15&&diff[k]<=diff[k-1]&&diff[k]<diff[k+1])minima.push(k);
 let lag=minima[0]||0;
 for(const k of minima){if(!lag)break;if(k>lag*3.1)break;if(diff[k]<diff[lag]*.25&&diff[lag]-diff[k]>.002)lag=k;}
 if(!lag)return null;
 const left=diff[lag-1],middle=diff[lag],right=diff[lag+1]??middle,denom=left-2*middle+right;
 const shift=denom?Math.max(-1,Math.min(1,.5*(left-right)/denom)):0;
 return rate/(lag+shift);
}
// Checagem de consistência por correlação normalizada; desacordo evita uma orientação falsa.
export function correlationPitch(data,rate){
 const min=Math.max(2,Math.floor(rate/1000)),max=Math.min(Math.ceil(rate/100),Math.floor(data.length/2)-1),size=data.length-max;
 const scores=new Float64Array(max+1);let peak=0;
 for(let lag=min;lag<=max;lag++){let cross=0,a=0,b=0;for(let i=0;i<size;i++){cross+=data[i]*data[i+lag];a+=data[i]**2;b+=data[i+lag]**2;}scores[lag]=2*cross/(a+b||1);if(scores[lag]>peak)peak=scores[lag];}
 if(peak<.9)return null;
 for(let k=min+1;k<max;k++)if(scores[k]>scores[k-1]&&scores[k]>=scores[k+1]&&scores[k]>=peak-.005){const denom=scores[k-1]-2*scores[k]+scores[k+1],shift=denom?.5*(scores[k-1]-scores[k+1])/denom:0;return rate/(k+Math.max(-1,Math.min(1,shift)));}
 return null;
}
export function measurePitch(data,rate){const yin=detectPitch(data,rate);if(!yin)return {hz:null,reason:'sem periodicidade estável'};const correlation=correlationPitch(data,rate);if(!correlation||Math.abs(1200*Math.log2(yin/correlation))>8)return {hz:null,reason:'estimativas em desacordo',yin,correlation};return {hz:yin,reason:'estimativas consistentes',yin,correlation};}
export function spectralPitch(db,rate,size){
 const step=rate/size,min=Math.ceil(250/step),max=Math.floor(850/step),floor=[...db.slice(min,max)].sort((a,b)=>a-b)[Math.floor((max-min)/2)],peaks=[];
 for(let i=min;i<=max;i++){if(db[i]<db[i-1]||db[i]<db[i+1]||db[i]<-75||db[i]-floor<16)continue;const den=db[i-1]-2*db[i]+db[i+1],offset=den?.5*(db[i-1]-db[i+1])/den:0;peaks.push({hz:(i+Math.max(-.5,Math.min(.5,offset)))*step,db:db[i]});}
 if(!peaks.length)return null;const top=Math.max(...db.slice(min,Math.min(db.length,Math.floor(2600/step))));
 const amp=hz=>{const center=Math.round(hz/step);let d=-200;for(let i=Math.max(0,center-1);i<=Math.min(db.length-1,center+1);i++)d=Math.max(d,db[i]);return 10**((d-top)/20);};
 const scored=peaks.map(p=>{const a=amp(p.hz),b=amp(p.hz*2),c=amp(p.hz*3),support=[a,b,c].filter(v=>v>.08).length;return {...p,score:(a+.65*b+.4*c)*(1+.15*Math.max(0,support-1))};}).sort((a,b)=>b.score-a.score);
 if(scored[0].score<.25)return null;
 if(scored[1]&&scored[1].score>scored[0].score*.85)return null;
 return scored[0].hz;
}

export function createPitchTracker(holdMs=2500){
 let samples=[],value=null,at=-Infinity,candidate=null,count=0,accepted=0,firstAt=null;
 return {
 reset(){samples=[];value=null;at=-Infinity;candidate=null;count=0;accepted=0;firstAt=null;},
 update(hz,now){
 if(Number.isFinite(hz)&&hz>0){
 const jump=value&&now-at<holdMs&&Math.abs(1200*Math.log2(hz/value))>80;
 if(jump){if(candidate&&Math.abs(1200*Math.log2(hz/candidate))<50)count++;else count=1;candidate=hz;if(count>=2){samples=[];value=null;accepted=0;firstAt=null;}}
 if(!jump||count>=2){candidate=null;count=0;accepted++;firstAt??=now;samples.push(hz);if(samples.length>5)samples.shift();value=[...samples].sort((a,b)=>a-b)[Math.floor(samples.length/2)];at=now;}
 }
 if(value===null||now-at>=holdMs){samples=[];value=null;accepted=0;firstAt=null;return null;}
 return {hz:value,held:now-at>250,age:now-at,stable:accepted>=4&&now-firstAt>=300&&1200*Math.log2(Math.max(...samples)/Math.min(...samples))<=10};
 }
 };
}
export function tuningReading(hz,target='cavaquinho') {
 const targets=Object.fromEntries(STRINGS.map(s=>[s.id,s.hz]));
 const descriptions=Object.fromEntries(STRINGS.map(s=>[s.id,`${s.name} · ${s.number}ª corda`]));

 const info=pitchInfo(hz);let key=target,automatic=target==='cavaquinho';
 if(automatic)key=Object.keys(targets).sort((a,b)=>Math.abs(Math.log2(hz/targets[a]))-Math.abs(Math.log2(hz/targets[b])))[0];
 const ref=targets[key.split('-')[0]],cents=ref?Math.round(1200*Math.log2(hz/ref)):info.cents;
 const uncertain=!!ref&&Math.abs(cents)>(automatic?130:250);
 return {...info,cents,target:ref?descriptions[key]||descriptions[key.split('-')[0]]:info.name,referenceHz:ref||440*2**((Math.round(69+12*Math.log2(hz/440))-69)/12),uncertain,state:uncertain?'uncertain':Math.abs(cents)<=5?'in':cents<0?'low':'high'};
}
export function tuningFeedback(hz,target){
 const p=tuningReading(hz,target),direction=p.cents<0?'abaixo':'acima',signed=`${p.cents>0?'+':''}${p.cents}`;
 return {...p,
 message:p.uncertain?`Som captado ${direction} do alvo · confirme a corda selecionada`:p.state==='in'?'Afinado ✓':p.state==='low'?'Abaixo do alvo · aumente para mais AGUDO':'Acima do alvo · diminua para mais GRAVE',
 readout:`${signed} cents · alvo ${p.referenceHz.toFixed(2)} Hz${Math.abs(p.cents)>50?' · fora da escala do ponteiro':''}`,
 detail:`Captado: ${p.name}, ${hz.toFixed(2)} Hz. Alvo: ${p.target}, ${p.referenceHz.toFixed(2)} Hz. `+(p.uncertain?'A diferença é grande. Se você tocou a primeira corda, selecione “1ª corda · Ré5”. Pode haver outra nota ou um harmônico; não faça uma grande alteração na tarraxa só por esta leitura.':target==='cavaquinho'?'Alvo sugerido pela altura: a 4ª corda é Ré4 e a 1ª é Ré5, uma oitava acima.':'Ajuste devagar e toque novamente.')
 };
}
export function pitchInfo(hz){const midi=Math.round(69+12*Math.log2(hz/440));const ref=440*2**((midi-69)/12);return {name:['Dó','Dó♯','Ré','Ré♯','Mi','Fá','Fá♯','Sol','Sol♯','Lá','Lá♯','Si'][((midi%12)+12)%12]+(Math.floor(midi/12)-1),cents:Math.round(1200*Math.log2(hz/ref))};}
export function audioPage(){return `<div class="heading"><div class="eyebrow">ESCUTE, COMPARE, AJUSTE</div><h1>Seu laboratório de áudio</h1><p>Grave um trecho, escute com atenção e acompanhe a afinação de cordas isoladas.</p></div><section class="card capture-toolbar"><div class="section-head"><div><h2>Uma entrada para todas as funções</h2><p>Gravador e afinador usam o mesmo microfone. A barra confirma o som recebido antes de identificar notas.</p></div><span class="badge">Áudio · 0.14.0</span></div><label>Entrada de áudio<select id="mic-device"><option value="">Microfone padrão do dispositivo</option></select></label><div class="actions"><button class="primary" id="mic-toggle">Ligar microfone</button><button class="secondary" id="resume-audio" hidden>Retomar processamento de áudio</button><button class="text-button" id="audio-diagnostics">Baixar diagnóstico técnico</button></div><p id="capture-status" role="status">Microfone desligado.</p><div class="input-level"><span>Nível de entrada · compartilhado pelo gravador e afinador</span><div class="level-track"><div id="mic-level"></div></div><span id="signal-label">desligado</span></div><p id="capture-info" class="muted">O áudio permanece no dispositivo.</p></section><div class="library audio-library"><section class="card"><h2>Gravar minha prática</h2><p>Use fones e desligue o metrônomo antes de gravar. Você pode acompanhar o afinador enquanto grava. Ambos recebem a mesma entrada.</p><button class="primary" id="record">Iniciar gravação</button><p id="record-status" role="status">Gravador parado.</p><div id="recordings"></div><p class="muted">Gravações ficam somente nesta tela. Baixe antes de sair. Nenhum áudio é enviado a servidores.</p></section><section class="card"><h2>Identificar pelo microfone</h2><label>O que você quer identificar?<select id="listen-mode"><option value="note">Nota isolada / afinador</option><option value="chord">Acorde maior ou menor (experimental)</option></select></label><p>Toque uma corda solta de cada vez e deixe soar. Referência: Lá = 440 Hz. Afinação comum, da 4ª à 1ª: Ré4 · Sol4 · Si4 · Ré5.</p><div class="note"><strong>Referência corrigida nesta versão</strong><p>A 1ª corda é Ré5 (587,33 Hz). A 4ª é Ré4 (293,66 Hz), uma oitava abaixo. As versões anteriores do app usavam oitavas incorretas.</p></div><label style="margin-top:12px">Corda-alvo<select id="target-note"><option value="cavaquinho">Automático · cordas soltas do cavaquinho</option><option value="auto">Cromático · qualquer nota</option><option value="D4">4ª corda · Ré4 (D4)</option><option value="G4">3ª corda · Sol4 (G4)</option><option value="B4">2ª corda · Si4 (B4)</option><option value="D5">1ª corda · Ré5 (D5)</option></select></label><div class="actions"><button class="secondary" id="tune">Ligar afinador</button></div><div class="tuner-panel" id="tuner-panel" data-state="idle"><div class="tuner-note" id="pitch">—</div><div id="detected-string" class="tuner-string">Corda ainda não identificada</div><div id="tuning-message" role="status">Ligue o afinador para começar</div><div class="tuning-gauge" role="meter" aria-label="Desvio de afinação em cents" aria-valuemin="-50" aria-valuemax="50" aria-valuenow="0" id="tuning-gauge"><div class="tuning-center"></div><div class="tuning-needle" id="tuning-needle"></div></div><div class="tuning-scale"><span>−50 · abaixo</span><span>0</span><span>acima · +50</span></div><div id="cents-readout">— cents</div></div><p id="pitch-detail">Notas: confira com outro afinador. Acordes: apenas hipótese de tríade maior ou menor; não reconhece sétimas e pode confundir harmônicos.</p></section><section class="card"><h2>Escuta de referência</h2><p>Abra um áudio seu ou autorizado. Reduza a velocidade para estudar um trecho; ative a repetição para voltar a ouvi-lo.</p><label>Arquivo de áudio<input type="file" id="audio-file" accept="audio/*"></label><audio id="reference" controls style="width:100%;margin-top:16px"></audio><label>Velocidade<select id="speed"><option value="0.5">50%</option><option value="0.75">75%</option><option value="1" selected>100%</option><option value="1.25">125%</option></select></label><label style="display:flex;margin-top:15px"><input type="checkbox" id="loop" style="width:auto"> Repetir o arquivo inteiro</label><p class="muted">O player preserva o tom quando suportado pelo navegador. A repetição abrange todo o arquivo.</p></section><section class="card"><h2>O que observar ao ouvir</h2><p>1. O pulso continua durante as trocas?<br>2. As notas soam claras ou abafadas?<br>3. Você consegue repetir o mesmo trecho com consistência?</p><div class="success">Registre sua percepção no histórico de prática. O reconhecimento de acordes é experimental e não avalia sua execução.</div></section></div>`;}
export function mountAudio(){
 const $=id=>document.getElementById(id),record=$('record'),tune=$('tune'),status=$('record-status');
 let stream=null,ctx=null,recorder=null,frame=null,disposed=false,opening=null,tuning=false,analyser=null,source=null,mute=null,last=0,history=[],rms=0,lastHz=null,lastError='',chunks=[];
 const urls=[],tracker=createPitchTracker();let lastMeasurement=null;
 const error=e=>e.name==='NotAllowedError'?'Permissão de microfone negada. Libere o acesso ao microfone nas configurações deste site.':e.name==='NotFoundError'?'Nenhum microfone encontrado. Conecte um microfone e tente novamente.':e.name==='NotReadableError'?'O microfone está indisponível. Confira se outro aplicativo está usando o dispositivo.':e.name==='OverconstrainedError'?'A entrada selecionada não está disponível. Escolha outro microfone.':e.message||'Não foi possível abrir o microfone.';
 async function refreshDevices(){try{const devices=await navigator.mediaDevices.enumerateDevices();if(disposed)return;const select=$('mic-device'),selected=select.value;select.replaceChildren(new Option('Microfone padrão do dispositivo',''));for(const [i,d] of devices.filter(d=>d.kind==='audioinput').entries())select.add(new Option(d.label||`Microfone ${i+1}`,d.deviceId));select.value=selected;}catch{}}
 refreshDevices();
 function idle(message='Ligue o afinador para começar'){$('detected-string').textContent='Corda ainda não identificada';$('tuner-panel').dataset.state='idle';$('pitch').textContent='—';$('tuning-message').textContent=message;$('cents-readout').textContent='— cents';$('tuning-needle').style.transform='translateX(-50%) rotate(0deg)';$('tuning-gauge').setAttribute('aria-valuenow','0');}
 function display(hz){const target=$('target-note').value,p=tuningFeedback(hz,target);$('tuner-panel').dataset.state=p.state;$('pitch').textContent=p.name;$('detected-string').textContent=target==='auto'?'Modo cromático · sem identificação de corda':`${target==='cavaquinho'?'Alvo sugerido':'Alvo'}: ${p.target}`;
 $('tuning-message').textContent=p.message;$('cents-readout').textContent=p.readout;
 $('tuning-needle').style.transform=`translateX(-50%) rotate(${p.uncertain?0:Math.max(-50,Math.min(50,p.cents))*.8}deg)`;$('tuning-gauge').setAttribute('aria-valuenow',String(p.uncertain?0:Math.max(-50,Math.min(50,p.cents))));$('pitch-detail').textContent=p.detail;
 }
 $('target-note').onchange=()=>{tracker.reset();idle('Alvo alterado · toque a corda novamente');};
 function syncContext(){if(disposed||!ctx)return;const suspended=ctx.state!=='running';$('resume-audio').hidden=!suspended;$('capture-status').textContent=suspended?'Microfone conectado, mas o navegador suspendeu o processamento. Clique em retomar.':'Microfone conectado. O nível abaixo mostra o sinal recebido.';const track=stream?.getAudioTracks()[0];$('capture-info').textContent=`${track?.label||'Entrada padrão'} · ${ctx.sampleRate} Hz · processamento ${ctx.state}`;}
 function process(now){if(disposed||!stream||!ctx)return;
 if(now-last>=100){last=now;const data=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(data);const recent=data.subarray(data.length-4096);let power=0;for(const x of recent)power+=x*x;rms=Math.sqrt(power/recent.length);$('mic-level').style.width=Math.min(100,Math.max(0,(20*Math.log10(Math.max(rms,1e-6))+65)/65*100))+'%';$('signal-label').textContent=ctx.state!=='running'?'processamento suspenso':rms<.0005?'sinal baixo ou ausente':rms>.5?'sinal muito alto':'recebendo som';
 if(tuning&&ctx.state==='running'){
 if($('listen-mode').value==='chord'){tracker.reset();history=[];lastHz=null;const spectrum=new Float32Array(analyser.frequencyBinCount);analyser.getFloatFrequencyData(spectrum);const guess=estimateTriad(spectrum,ctx.sampleRate,analyser.fftSize);idle('Reconhecimento experimental de tríades');$('pitch').textContent=guess?guess.label+' ?':'—';$('pitch-detail').textContent=guess?'Hipótese de acorde. Confirme tocando as notas separadamente.':'Sem identificação confiável. Toque um acorde maior ou menor e deixe soar.';
 }else{lastMeasurement=measurePitch(recent,ctx.sampleRate);if($('target-note').value!=='auto'){const spectrum=new Float32Array(analyser.frequencyBinCount);analyser.getFloatFrequencyData(spectrum);const spectral=spectralPitch(spectrum,ctx.sampleRate,analyser.fftSize);if(spectral){lastMeasurement={...lastMeasurement,hz:spectral,reason:'pico espectral com suporte harmônico',spectral};}else if(lastMeasurement.hz&&(lastMeasurement.hz<250||lastMeasurement.hz>850))lastMeasurement={...lastMeasurement,hz:null,reason:'fora da região das cordas soltas'};}const hz=lastMeasurement.hz;lastHz=hz;const reading=tracker.update(hz,now);if(reading){display(reading.hz);if(!reading.stable&&!reading.held){$('tuner-panel').dataset.state='acquiring';$('tuning-message').textContent='Confirmando a nota · deixe a corda soar';}if(reading.held){$('tuner-panel').dataset.state='held';$('tuning-message').textContent='Última leitura · toque a corda novamente';$('pitch-detail').textContent=`${reading.hz.toFixed(1)} Hz · sinal decaindo ou interrompido. Ponteiro mantido por até 2,5 s; não é uma nova medição.`;}}else{idle(rms<.0005?'Sem sinal suficiente na entrada':'Som captado · aguardando uma nota estável');$('pitch-detail').textContent=rms<.0005?'Toque a corda novamente. Se a barra não reagir, confira a entrada selecionada.':'O microfone recebe som. Toque uma única corda e deixe soar, sem outras notas.';}}}}

 frame=requestAnimationFrame(process);}
 async function ensureCapture(){if(stream&&ctx)return stream;if(opening)return opening;
 opening=(async()=>{try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Microfone indisponível. Abra o aplicativo em HTTPS.');
 // Uma única captura para gravação e análise, preservando o decaimento do instrumento.
 // O mesmo MediaStream alimenta a gravação e a análise: não há duas rotas de entrada.
 ctx=new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();if(disposed){await ctx.close();return null;}
 const device=$('mic-device').value;const input=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:{ideal:false},noiseSuppression:{ideal:false},autoGainControl:{ideal:false},...(device?{deviceId:{exact:device}}:{})}});
 if(disposed){input.getTracks().forEach(t=>t.stop());await ctx?.close();return null;}stream=input;analyser=ctx.createAnalyser();analyser.fftSize=8192;analyser.smoothingTimeConstant=0;source=ctx.createMediaStreamSource(stream);mute=ctx.createGain();mute.gain.value=0;source.connect(analyser);analyser.connect(mute);mute.connect(ctx.destination);
 stream.getAudioTracks()[0].addEventListener('ended',()=>{if(!disposed){stopCapture();$('capture-status').textContent='O microfone foi desconectado. Conecte novamente e clique em ligar.';}},{once:true});
 ctx.onstatechange=syncContext;await refreshDevices();if(disposed)return null;$('mic-device').disabled=true;$('mic-toggle').textContent='Desligar microfone';syncContext();frame=requestAnimationFrame(process);lastError='';return stream;
 }catch(e){lastError=error(e);await stopCapture();if(!disposed)$('capture-status').textContent=lastError;return null;}finally{opening=null;}})();return opening;}
 async function stopCapture(){tracker.reset();tuning=false;history=[];lastHz=null;cancelAnimationFrame(frame);frame=null;if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());stream=null;source?.disconnect();mute?.disconnect();source=null;mute=null;analyser=null;const old=ctx;ctx=null;if(old){old.onstatechange=null;if(old.state!=='closed')await old.close();}if(disposed)return;$('mic-device').disabled=false;$('mic-toggle').textContent='Ligar microfone';$('resume-audio').hidden=true;$('capture-status').textContent='Microfone desligado.';$('capture-info').textContent='O áudio permanece no dispositivo.';$('signal-label').textContent='desligado';$('mic-level').style.width='0%';tune.textContent='Ligar afinador';idle();}
 $('mic-toggle').onclick=async()=>{if(opening)return;$('mic-toggle').disabled=true;try{if(stream)await stopCapture();else await ensureCapture();}finally{if(!disposed)$('mic-toggle').disabled=false;}};
 $('resume-audio').onclick=async()=>{try{await ctx?.resume();syncContext();}catch(e){lastError=error(e);$('capture-status').textContent=lastError;}};
 tune.onclick=async()=>{if(opening)return;if(tuning){tracker.reset();tuning=false;tune.textContent='Ligar afinador';idle('Afinador desligado · entrada continua disponível');return;}tune.disabled=true;try{const input=await ensureCapture();if(!input||disposed)return;tracker.reset();tuning=true;tune.textContent='Desligar afinador';history=[];idle('Ouvindo · toque uma corda solta');}finally{if(!disposed)tune.disabled=false;}};
 record.onclick=async()=>{if(opening)return;if(recorder?.state==='recording'){recorder.stop();record.disabled=true;return;}record.disabled=true;try{if(!window.MediaRecorder)throw new Error('Este navegador não oferece gravação de áudio.');const input=await ensureCapture();if(!input||disposed)return;chunks=[];recorder=new MediaRecorder(input);recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=e=>{if(!disposed)status.textContent='Falha na gravação. Tente novamente.';};recorder.onstop=()=>{if(disposed)return;const blob=new Blob(chunks,{type:recorder.mimeType});const url=URL.createObjectURL(blob);urls.push(url);const row=document.createElement('div'),player=document.createElement('audio'),link=document.createElement('a');player.controls=true;player.src=url;player.style.width='100%';link.href=url;link.download='pratica-'+Date.now()+(blob.type.includes('mp4')?'.mp4':blob.type.includes('ogg')?'.ogg':'.webm');link.textContent='Baixar gravação ↓';row.append(player,link);$('recordings').prepend(row);status.textContent='Gravação pronta. A entrada continua disponível para o afinador.';record.textContent='Gravar novamente';record.disabled=false;};recorder.start();status.textContent='● Gravando a mesma entrada usada pelo afinador.';record.textContent='Parar gravação';}catch(e){lastError=error(e);status.textContent=lastError;}finally{if(!disposed)record.disabled=false;}};
 $('audio-diagnostics').onclick=()=>{const diagnostics={version:'0.14.0',secureContext:window.isSecureContext,supported:{microphone:!!navigator.mediaDevices?.getUserMedia,audioContext:!!(window.AudioContext||window.webkitAudioContext),recorder:!!window.MediaRecorder},contextState:ctx?.state||'off',sampleRate:ctx?.sampleRate||null,trackState:stream?.getAudioTracks()[0]?.readyState||'off',trackMuted:stream?.getAudioTracks()[0]?.muted??null,rms,detectedHz:lastHz,measurement:lastMeasurement,target:$('target-note').value,tuning,lastError};const url=URL.createObjectURL(new Blob([JSON.stringify(diagnostics,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='diagnostico-audio.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const player=$('reference');$('audio-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const url=URL.createObjectURL(f);urls.push(url);player.src=url;};$('speed').onchange=e=>{player.playbackRate=Number(e.target.value);player.preservesPitch=true;};$('loop').onchange=e=>{player.loop=e.target.checked;};player.onerror=()=>{status.textContent='Formato não suportado pelo navegador. Tente MP3, WAV ou outro formato compatível.';};
 return ()=>{disposed=true;stopCapture();player.pause();document.querySelectorAll('#recordings audio').forEach(a=>a.pause());urls.forEach(u=>URL.revokeObjectURL(u));};
}
