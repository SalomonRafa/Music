export function separatorPage(){return `<section class="card stem-separator"><div class="section-head"><h2>Separar voz e instrumental</h2><span class="badge">Separação por IA</span></div><p>Crie um acompanhamento para tocar cavaquinho. Escolha uma música, separe as faixas e baixe o instrumental. Podem restar voz, ecos ou alterações nos instrumentos.</p><p id="separator-status" role="status">Serviço ainda não conectado. Configure a conexão abaixo; nenhum arquivo será enviado antes de você tocar em Separar.</p><details id="separator-settings"><summary>Conexão do serviço de separação</summary><p>Esta função precisa de um serviço de processamento próprio. O endereço será informado quando a hospedagem estiver ativada.</p><label>Endereço do serviço<input id="separator-url" type="url" placeholder="https://separador.exemplo.com" autocomplete="url"></label><label>Chave de acesso pessoal<input id="separator-key" type="password" autocomplete="off" placeholder="Chave fornecida na ativação"></label><button type="button" class="secondary" id="separator-connect">Verificar conexão</button><p class="muted">A chave fica somente nesta tela. O arquivo será enviado ao serviço indicado acima. Ao sair, solicitamos a exclusão; os resultados expiram uma hora após o processamento.</p></details><label style="margin-top:18px">Música para acompanhar<input id="separator-file" type="file" accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg,.weba,.webm"></label><p class="muted">Até 40 MB e 10 minutos. Use um arquivo que você possa utilizar. O processamento pode levar vários minutos.</p><div class="actions"><button type="button" class="primary" id="separator-start" disabled>Separar voz e instrumental</button><button type="button" class="secondary" id="separator-cancel" hidden>Cancelar e excluir</button></div><div id="separator-results" hidden><p>Baixe as faixas antes de sair desta tela. Os resultados não ficam salvos no repertório.</p><div class="stem-results"><div><h3>Instrumental</h3><audio id="stem-instrumental" controls preload="metadata"></audio><a id="download-instrumental" class="secondary" download="instrumental.wav">Baixar instrumental WAV</a><button type="button" class="secondary" id="practice-instrumental">Usar na escuta de referência</button></div><div><h3>Voz isolada</h3><audio id="stem-vocals" controls preload="metadata"></audio><a id="download-vocals" class="secondary" download="voz.wav">Baixar voz WAV</a></div></div></div></section>`;}
export function separatorEndpoint(value){
 const url=new URL(value.trim());
 if(url.username||url.password||url.search||url.hash)throw Error('Use apenas o endereço do serviço, sem chave ou parâmetros na URL.');
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))throw Error('Use um endereço HTTPS para proteger o envio do áudio.');
 return url.href.replace(/\/$/,'');
}
export function mountSeparator(){
 const $=id=>document.getElementById(id),status=$('separator-status');
 let endpoint='',key='',ready=false,busy=false,disposed=false,job=null,controller=null,timer=null,revision=0;
 const urls=[];let wake=null;
 const message=s=>{if(!disposed)status.textContent=s;};
 try{$('separator-url').value=localStorage.getItem('mestre-separator-url')||'';}catch{}
 function sync(){if(disposed)return;$('separator-start').disabled=!ready||busy||!$('separator-file').files[0];$('separator-connect').disabled=busy;$('separator-url').disabled=busy;$('separator-key').disabled=busy;$('separator-file').disabled=busy;$('separator-cancel').hidden=!busy&&!job;}
 async function request(path,options={},timeout=20000){
 const current=new AbortController();controller=current;const timeoutId=setTimeout(()=>current.abort(),timeout);
 try{const response=await fetch(endpoint+path,{...options,headers:{Authorization:'Bearer '+key,...options.headers},signal:current.signal,credentials:'omit',cache:'no-store',redirect:'error'});
 if(!response.ok){let detail='';try{detail=(await response.json()).detail;}catch{}throw Error(typeof detail==='string'?detail:`O serviço respondeu com erro ${response.status}.`);}return response;
 }finally{clearTimeout(timeoutId);if(controller===current)controller=null;}
 }
 async function erase(id){if(!id||!endpoint)return;try{await fetch(endpoint+'/jobs/'+encodeURIComponent(id),{method:'DELETE',headers:{Authorization:'Bearer '+key},credentials:'omit',keepalive:true,redirect:'error'});}catch{}}
 function clearResults(){for(const id of ['instrumental','vocals']){$('stem-'+id).pause();$('stem-'+id).removeAttribute('src');$('download-'+id).removeAttribute('href');}urls.splice(0).forEach(u=>URL.revokeObjectURL(u));$('separator-results').hidden=true;}
 function cancelWait(){clearTimeout(timer);wake?.();wake=null;}
 function wait(){return new Promise(resolve=>{wake=resolve;timer=setTimeout(()=>{wake=null;resolve();},2000);});}
 async function cancel(){revision++;controller?.abort();cancelWait();const old=job;job=null;busy=false;clearResults();sync();message('Processamento encerrado. Exclusão solicitada ao serviço.');await erase(old);}
 $('separator-cancel').onclick=cancel;
 const invalidate=()=>{ready=false;sync();message('Conexão alterada. Verifique o serviço antes de enviar um arquivo.');};
 $('separator-url').oninput=invalidate;$('separator-key').oninput=invalidate;
 $('separator-connect').onclick=async()=>{busy=true;ready=false;sync();message('Verificando serviço e modelo de separação…');try{endpoint=separatorEndpoint($('separator-url').value);key=$('separator-key').value.trim();if(!key)throw Error('Informe a chave de acesso fornecida na ativação.');const data=await(await request('/health')).json();if(data.service!=='cavaco-separator'||data.version!==1)throw Error('Esse endereço não oferece o serviço de separação compatível.');if(!data.ready)throw Error(data.error||'O serviço está carregando o modelo. Aguarde e verifique novamente.');if(disposed)return;ready=true;try{localStorage.setItem('mestre-separator-url',endpoint);}catch{}message('Serviço conectado. Escolha a música e toque em Separar para enviá-la.');$('separator-settings').open=false;}catch(e){message(e.name==='AbortError'?'O serviço demorou a responder. Verifique a conexão.':e.message==='Failed to fetch'?'Não foi possível conectar. Confira endereço, HTTPS e disponibilidade do serviço.':e.message);}finally{busy=false;sync();}};
 $('separator-file').onchange=()=>{const file=$('separator-file').files[0];if(file&&(!file.size||file.size>40*1024*1024)){message('Escolha um arquivo não vazio de até 40 MB.');$('separator-file').value='';}sync();};
 $('separator-start').onclick=async()=>{
 const file=$('separator-file').files[0];if(!file||!ready||busy)return;
 const run=++revision;busy=true;sync();clearResults();const old=job;job=null;await erase(old);
 try{
 message('Enviando a música ao serviço de separação…');
 const data=await(await request('/jobs',{method:'POST',body:file,headers:{'Content-Type':'application/octet-stream'}},120000)).json();
 if(typeof data.id!=='string'||!/^[A-Za-z0-9_-]{10,80}$/.test(data.id))throw Error('O serviço retornou uma identificação inválida.');
 if(disposed||run!==revision){await erase(data.id);return;}job=data.id;sync();
 const started=Date.now();
 while(!disposed&&run===revision){
 const result=await(await request('/jobs/'+encodeURIComponent(job))).json();
 if(disposed||run!==revision)return;
 if(result.state==='failed')throw Error(result.error||'Não foi possível separar este áudio.');
 if(result.state==='cancelled')throw Error('O processamento foi cancelado pelo serviço.');
 if(result.state==='ready')break;
 if(!['queued','uploading','processing'].includes(result.state))throw Error('Estado de processamento não reconhecido.');
 message(result.state==='queued'?'Música na fila de processamento…':'Separando voz e instrumental por IA… Isso pode levar vários minutos.');
 if(Date.now()-started>35*60*1000)throw Error('O processamento excedeu o tempo esperado.');
 await wait();
 }
 if(disposed||run!==revision)return;
 message('Separação concluída. Preparando as duas faixas para ouvir e baixar…');
 for(const stem of ['instrumental','vocals']){
 const response=await request('/jobs/'+encodeURIComponent(job)+'/'+stem,{},120000);const blob=await response.blob();
 if(disposed||run!==revision)return;
 if(!blob.size)throw Error('O serviço retornou uma faixa vazia.');const url=URL.createObjectURL(blob);urls.push(url);$('stem-'+stem).src=url;$('download-'+stem).href=url;
 }
 $('separator-results').hidden=false;message('Instrumental e voz disponíveis. Ouça o resultado e baixe antes de sair.');
 }catch(e){if(disposed||run!==revision)return;clearResults();message(e.name==='AbortError'?'A conexão demorou demais. Tente novamente.':e.message==='Failed to fetch'?'A conexão com o serviço foi interrompida. Tente novamente.':e.message);const failed=job;job=null;await erase(failed);
 }finally{if(run===revision){busy=false;sync();}}
 };
 for(const stem of ['instrumental','vocals'])$('stem-'+stem).onplay=()=>{for(const other of ['instrumental','vocals'])if(other!==stem)$('stem-'+other).pause();document.getElementById('reference')?.pause();};
 $('practice-instrumental').onclick=()=>{const player=document.getElementById('reference');if(!player||!$('stem-instrumental').src)return;player.pause();player.src=$('stem-instrumental').src;for(const stem of ['instrumental','vocals'])$('stem-'+stem).pause();player.scrollIntoView({block:'center',behavior:'smooth'});message('Instrumental carregado na escuta de referência. Use os controles de velocidade e repetição.');};
 sync();
 return ()=>{disposed=true;revision++;controller?.abort();cancelWait();const old=job;job=null;erase(old);for(const stem of ['instrumental','vocals'])$('stem-'+stem)?.pause();urls.forEach(u=>URL.revokeObjectURL(u));};
}
