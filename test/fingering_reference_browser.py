from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'))
 page.get_by_role('button',name='Acordes',exact=True).click();page.locator('#chord-symbol').fill('Bbm');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 def fingers(selector):
  svg=page.locator(selector)
  assert svg.locator('.chord-note-label').all_text_contents()==['2','3','1','4']
  assert svg.locator('.chord-barre').count()==0
 fingers('.primary-shape svg')
 assert page.locator('.primary-shape').get_attribute('data-shape')=='3,3,2,3'
 assert page.locator('.chord-shape').count()==5
 page.locator('.primary-shape summary').click();assert 'Casa de Bamba' in page.locator('.primary-shape').inner_text()
 page.locator('.primary-shape summary').click()
 page.locator('.primary-shape').screenshot(path='/tmp/bbm-referencia-casa-de-bamba.png')
 page.locator('.primary-shape [data-set-primary]').click();fingers('.primary-shape svg')
 page.locator('#chord-diagram-mode').select_option('frets')
 assert page.locator('.primary-shape .chord-note-label').all_text_contents()==['3','3','2','3']
 page.get_by_role('button',name='Repertório',exact=True).click();page.locator('#song-source').fill('Bbm');page.locator('#preview-chart').click()
 fingers('#song-diagrams svg')
 page.locator('#chart [data-lookup="Bbm"]').click();fingers('#popover-content svg');fingers('#lookup-area .primary-shape svg')
 page.get_by_role('button',name='Acordes',exact=True).click();page.locator('#chord-symbol').fill('Cm');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('.primary-shape').get_attribute('data-shape')=='5,5,4,5';fingers('.primary-shape svg')
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 b.close()
 print('PASS: Bbm reproduz dedos da referência sem pestana em dicionário, escolha salva, cifra, faixa de diagramas e popup; transposição e modo casas preservados.')
