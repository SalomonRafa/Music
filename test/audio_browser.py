from playwright.sync_api import sync_playwright
import json, os, wave, struct, math, tempfile
from pathlib import Path
fd, wave_path=tempfile.mkstemp(suffix=".wav");os.close(fd)
with wave.open(wave_path,"wb") as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(48000)
 f.writeframes(b"".join(struct.pack("<h",int(32767*.008*(math.sin(2*math.pi*293.664768*i/48000)+.3*math.sin(4*math.pi*293.664768*i/48000)))) for i in range(48000*3)))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-file-for-fake-audio-capture='+wave_path])
 c=b.new_context(permissions=['microphone'],viewport={'width':1440,'height':1000});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('''window.captureCount=0;window.openTracks=[];const gum=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=async (...args)=>{window.captureCount++;const s=await gum(...args);window.openTracks.push(...s.getTracks());return s;}''')
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/')+'?v=0.10.0');page.get_by_role('button',name='Áudio',exact=True).click();page.get_by_text('Áudio · 0.10.0',exact=True).wait_for()
 page.get_by_role('button',name='Iniciar gravação',exact=True).click();page.get_by_role('button',name='Parar gravação',exact=True).wait_for();page.wait_for_function("document.querySelector('#signal-label').textContent==='recebendo som'")
 page.locator('#target-note').select_option(label='4ª corda · Ré4 (D4)');page.get_by_role('button',name='Ligar afinador',exact=True).click();page.wait_for_function("document.querySelector('#pitch').textContent==='Ré4'")
 assert page.evaluate('window.captureCount')==1
 assert page.get_by_role('button',name='Parar gravação',exact=True).is_enabled()
 with page.expect_download() as d:page.locator('#audio-diagnostics').click()
 diag=json.load(open(d.value.path()));assert diag['contextState']=='running' and diag['rms']>.002 and abs(diag['detectedHz']-293.66)<2

 page.get_by_role('button',name='Parar gravação',exact=True).click();page.get_by_role('link',name='Baixar gravação').wait_for();page.wait_for_function("document.querySelector('#pitch').textContent==='Ré4'")
 assert page.evaluate('window.openTracks[0].readyState')=='live'
 page.get_by_role('button',name='Desligar afinador',exact=True).click();assert page.evaluate('window.openTracks[0].readyState')=='live'
 page.get_by_role('button',name='Desligar microfone',exact=True).click();page.get_by_role('button',name='Ligar microfone',exact=True).wait_for();assert page.evaluate('window.openTracks[0].readyState')=='ended'
 page.get_by_role('button',name='Ligar afinador',exact=True).click();page.wait_for_function("document.querySelector('#pitch').textContent==='Ré4'");assert page.evaluate('window.captureCount')==2
 page.get_by_role('button',name='Visão geral',exact=True).click();assert page.evaluate('window.openTracks.every(t=>t.readyState==="ended")')
 page.get_by_role('button',name='Áudio',exact=True).click();page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 # Verifica tratamento de permissão negada, sem prometer sinal ou deixar controles travados.
 page.evaluate("() => { navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('denied','NotAllowedError')}; }")
 page.get_by_role('button',name='Ligar afinador',exact=True).click();page.get_by_text('Permissão de microfone negada. Libere o acesso ao microfone nas configurações deste site.',exact=True).wait_for()
 assert page.get_by_role('button',name='Ligar afinador',exact=True).is_enabled()
 assert not errors,errors
 print('PASS: mesma captura para gravar e afinar simultaneamente; Ré4 baixo detectado; medidor; diagnóstico; parar gravação preserva afinador; reinício; liberação ao navegar; permissão negada; responsividade.')
 b.close()


# Uma palhetada sintética com decaimento, seguida de silêncio longo.
with wave.open(wave_path,"wb") as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(48000)
 def pluck(i):
  t=i/48000-.4
  if t<0 or t>1.2:return 0
  return int(32767*.04*math.exp(-t*5)*(math.sin(2*math.pi*293.664768*t)+.3*math.sin(4*math.pi*293.664768*t)))
 f.writeframes(b"".join(struct.pack("<h",pluck(i)) for i in range(48000*10)))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-file-for-fake-audio-capture='+wave_path])
 c=b.new_context(permissions=['microphone']);page=c.new_page()
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/')+'?v=0.10.0')
 page.get_by_role('button',name='Áudio',exact=True).click()
 page.locator('#target-note').select_option(label='4ª corda · Ré4 (D4)')
 page.get_by_role('button',name='Ligar afinador',exact=True).click()
 page.wait_for_function("document.querySelector('#pitch').textContent==='Ré4'",timeout=5000)
 page.wait_for_function("document.querySelector('#tuner-panel').dataset.state==='held'",timeout=6000)
 assert page.locator('#pitch').inner_text()=='Ré4'
 needle=page.locator('#tuning-needle').get_attribute('style')
 page.wait_for_timeout(900)
 assert page.locator('#pitch').inner_text()=='Ré4'
 assert page.locator('#tuning-needle').get_attribute('style')==needle
 page.wait_for_function("document.querySelector('#pitch').textContent==='—'",timeout=4000)
 assert page.locator('#tuner-panel').get_attribute('data-state')=='idle'
 print('PASS: palhetada com decaimento conserva nota e ponteiro após perda do sinal; leitura retida identificada; indicação expira após o período de retenção.')
 b.close()


# Direção de ajuste no navegador: Ré 20 cents grave, depois 20 cents agudo.
with wave.open(wave_path,"wb") as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(48000)
 def detuned(i):
  t=i/48000
  cents=-20 if t<3 else 20
  hz=293.6647679*2**(cents/1200)
  return int(32767*.04*(math.sin(2*math.pi*hz*t)+.3*math.sin(4*math.pi*hz*t)))
 f.writeframes(b"".join(struct.pack("<h",detuned(i)) for i in range(48000*7)))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-file-for-fake-audio-capture='+wave_path])
 c=b.new_context(permissions=['microphone']);page=c.new_page()
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/')+'?v=0.10.0')
 page.get_by_role('button',name='Áudio',exact=True).click()
 page.locator('#target-note').select_option(label='4ª corda · Ré4 (D4)')
 page.get_by_role('button',name='Ligar afinador',exact=True).click()
 page.wait_for_function("document.querySelector('#tuner-panel').dataset.state==='low'",timeout=5000)
 assert 'mais AGUDO' in page.locator('#tuning-message').inner_text()
 assert int(page.locator('#tuning-gauge').get_attribute('aria-valuenow'))<0
 page.wait_for_function("document.querySelector('#tuner-panel').dataset.state==='high'",timeout=5000)
 assert 'mais GRAVE' in page.locator('#tuning-message').inner_text()
 assert int(page.locator('#tuning-gauge').get_attribute('aria-valuenow'))>0
 print('PASS: Ré da 4ª corda abaixo pede mais AGUDO; acima pede mais GRAVE; ponteiro tem direção correta.')
 b.close()

Path(wave_path).unlink(missing_ok=True)
