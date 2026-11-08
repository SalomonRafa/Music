from playwright.sync_api import sync_playwright
import os,json
text='G#\nCm7  Fm7  G#7(4/9)\nLinha de estudo\nG#7(9)\nA#m7  D#7\nG#  C#9  D#9'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('if(!window.localStorage.getItem("mestre-songbook-v1"))window.localStorage.setItem("mestre-songbook-v1",'+json.dumps(json.dumps([{'id':'legacy','title':'Espelhos D’água · teste','text':text}]))+')')
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/')+'?v=0.18.0')
 page.get_by_role('button',name='Repertório',exact=True).click();page.locator('#saved-songs').select_option('legacy')
 assert page.locator('#song-source').input_value()==text
 assert page.locator('#song-diagrams [data-open-chord="G#7(4/9)"]').count()==1
 page.locator('#chart [data-lookup="G#7(4/9)"]').click();assert page.locator('#chord-popover').is_visible();assert page.locator('#popover-content svg').count()==1
 page.locator('#choose-song-shape').click();assert page.locator('#chord-popover').is_hidden()
 more=page.locator('#lookup-area .more-chord-shapes > summary')
 if more.count():more.click()
 chosen=page.locator('#lookup-area .variations-section [data-use-song-shape]').last.get_attribute('data-use-song-shape')
 page.locator('#lookup-area .variations-section [data-use-song-shape]').last.click()
 assert page.locator('#lookup-area .primary-shape').get_attribute('data-shape')==chosen
 saved=page.evaluate('JSON.parse(localStorage.getItem("mestre-songbook-v1"))[0]')
 assert saved['text']==text and len(saved['arrangement']['shapes'])==1
 assert page.evaluate('localStorage.getItem("mestre-primary-shapes-v1")') is None
 page.reload();page.get_by_role('button',name='Repertório',exact=True).click();page.locator('#saved-songs').select_option('legacy')
 page.locator('#chart [data-lookup="G#7(4/9)"]').click();assert chosen.replace(',','–') in page.locator('#popover-content').inner_text().replace(',','–') or chosen.replace(',','–') in page.locator('#song-diagrams [data-open-chord="G#7(4/9)"]').inner_text()
 page.locator('#close-chord-popover').click()
 before=page.evaluate('JSON.parse(localStorage.getItem("mestre-songbook-v1"))[0].arrangement')
 page.locator('#adapt-song').click();assert page.locator('#apply-arrangement').is_enabled()
 page.locator('#apply-arrangement').click();assert page.locator('#song-source').input_value()==text
 after=page.evaluate('JSON.parse(localStorage.getItem("mestre-songbook-v1"))[0].arrangement');assert len(after['shapes'])>len(before['shapes'])
 page.locator('#undo-arrangement').click();assert page.evaluate('JSON.parse(localStorage.getItem("mestre-songbook-v1"))[0].arrangement')==before
 page.locator('#transpose').select_option('2');assert page.locator('#chart [data-lookup="Bb7(4/9)"]').count()==1
 page.locator('#transpose').select_option('0');assert page.locator('#song-source').input_value()==text
 with page.expect_download() as d:page.locator('#export-arrangement').click()
 exported=json.load(open(d.value.path()));assert exported['text']==text and exported['format']=='mestre-song-arrangement'
 # Importação de backup preserva texto e escolhas.
 page.on('dialog',lambda dialog:dialog.accept())
 page.locator('#song-file').set_input_files({'name':'arranjo.json','mimeType':'application/json','buffer':json.dumps(exported).encode()})
 page.wait_for_function("document.querySelector('#saved-songs').value===''")
 assert page.locator('#song-source').input_value()==text
 page.locator('#song-title').fill('Cópia do teste');page.locator('#save-song').click()
 assert page.evaluate('JSON.parse(localStorage.getItem("mestre-songbook-v1")).length')==2
 page.set_viewport_size({'width':390,'height':844});page.locator('#chart [data-lookup="G#7(4/9)"]').click()
 rect=page.locator('#chord-popover').bounding_box();page.screenshot(path='/tmp/painel-leitura-mobile.png');assert rect['x']>=0 and rect['x']+rect['width']<=390.5 and rect['y']>=0 and rect['y']+rect['height']<=844.5
 page.screenshot(path='/tmp/cifra-com-diagrama.png')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 print('PASS: cifra antiga, clique com desenho, escolha só desta música, persistência, prévia de adaptação, aplicar/desfazer, harmonia preservada, transposição separada, backup/importação e popup móvel.')
 b.close()
