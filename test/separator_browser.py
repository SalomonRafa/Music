"""UI integration with mocked API and synthetic WAVs; no ML quality claims."""
from playwright.sync_api import sync_playwright
import io,json,os,wave
buffer=io.BytesIO()
with wave.open(buffer,'wb') as wav:
 wav.setnchannels(2);wav.setsampwidth(2);wav.setframerate(44100);wav.writeframes(b'\0'*17640)
audio=buffer.getvalue()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1400,'height':1000});errors=[];calls=[];state={'polls':0,'fail':False}
 page.on('pageerror',lambda e:errors.append(str(e)))
 def api(route):
  req=route.request;calls.append((req.method,req.url))
  assert req.headers.get('authorization')=='Bearer test-private-key'
  headers={'Access-Control-Allow-Origin':'*'}
  if req.url.endswith('/health'):data={'service':'cavaco-separator','version':1,'ready':True}
  elif req.method=='POST':
   assert req.post_data_buffer==audio
   data={'id':'synthetic-job-12345','state':'queued'}
  elif req.method=='DELETE':data={'deleted':True}
  elif req.url.endswith('/instrumental') or req.url.endswith('/vocals'):
   route.fulfill(status=200,body=audio,content_type='audio/wav',headers=headers);return
  else:
   state['polls']+=1
   data={'state':'failed','error':'Áudio de teste inválido.'} if state['fail'] else {'state':'processing' if state['polls']==1 else 'ready'}
  route.fulfill(status=200,body=json.dumps(data),content_type='application/json',headers=headers)
 page.route('https://separator.example/**',api)
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'))
 page.get_by_role('button',name='Áudio',exact=True).click()
 assert page.locator('#separator-start').is_disabled()
 page.locator('#separator-file').set_input_files({'name':'own-audio.wav','mimeType':'audio/wav','buffer':audio})
 assert not calls
 page.locator('#separator-settings summary').click()
 page.locator('#separator-url').fill('https://separator.example')
 page.locator('#separator-key').fill('test-private-key')
 page.locator('#separator-connect').click()
 page.wait_for_function("document.querySelector('#separator-start').disabled===false")
 assert len(calls)==1
 page.locator('#separator-start').click()
 page.locator('#separator-results').wait_for(state='visible')
 for stem in ['instrumental','vocals']:
  assert page.locator('#stem-'+stem).get_attribute('src').startswith('blob:')
 with page.expect_download() as downloaded:page.locator('#download-instrumental').click()
 assert downloaded.value.suggested_filename=='instrumental.wav'
 page.locator('#practice-instrumental').click()
 assert page.locator('#reference').get_attribute('src')==page.locator('#stem-instrumental').get_attribute('src')
 assert 'test-private-key' not in page.evaluate('JSON.stringify(localStorage)')
 page.locator('#separator-cancel').click()
 assert page.locator('#separator-results').is_hidden()
 page.wait_for_function("document.querySelector('#separator-start').disabled===false")
 state['fail']=True
 page.locator('#separator-start').click()
 page.get_by_text('Áudio de teste inválido.',exact=True).wait_for()
 assert page.locator('#separator-results').is_hidden()
 state['fail']=False;state['polls']=0
 page.locator('#separator-start').click()
 page.get_by_text('Separando voz e instrumental por IA… Isso pode levar vários minutos.',exact=True).wait_for()
 page.locator('#separator-cancel').click()
 page.wait_for_timeout(2200)
 assert page.locator('#separator-results').is_hidden()
 assert page.locator('#separator-start').is_enabled()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path='/tmp/separador-mobile.png',full_page=True)
 state['polls']=0
 page.locator('#separator-start').click()
 page.get_by_text('Separando voz e instrumental por IA… Isso pode levar vários minutos.',exact=True).wait_for()
 deletions=len([c for c in calls if c[0]=='DELETE'])
 page.get_by_role('button',name='Visão geral',exact=True).click()
 page.wait_for_timeout(300)
 assert len([c for c in calls if c[0]=='DELETE'])>deletions
 assert not errors,errors
 b.close()
 print('PASS: sem upload automático, conexão, separação simulada, duas faixas, download, player de estudo, erro, cancelamento, segredo fora do armazenamento e layout móvel.')
