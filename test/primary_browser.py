from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/')+'?v=0.17.2')
 def lookup(symbol):
  page.get_by_role('button',name='Acordes',exact=True).click();page.locator('#chord-symbol').fill(symbol);page.get_by_role('button',name='Consultar acorde',exact=True).click()
 lookup('Em9')
 assert page.locator('.primary-shape').get_attribute('data-shape')=='2,0,3,4'
 assert page.locator('.variations-section [data-shape="2,0,3,4"]').count()==0
 chosen=page.locator('.variations-section .chord-shape').first.get_attribute('data-shape')
 page.locator('.variations-section [data-set-primary]').first.click()
 assert page.locator('.primary-section').get_attribute('data-primary-type')=='personal'
 assert page.locator('.primary-shape').get_attribute('data-shape')==chosen
 assert page.locator(f'.variations-section [data-shape="{chosen}"]').count()==0
 page.locator('#chord-order').select_option('high');assert page.locator('.primary-shape').get_attribute('data-shape')==chosen
 page.reload();lookup('Em7(9)');assert page.locator('.primary-shape').get_attribute('data-shape')==chosen
 page.get_by_role('button',name='Repertório',exact=True).click();page.locator('#song-source').fill('Em9');page.locator('#preview-chart').click();page.locator('#chart [data-lookup="Em9"]').click();page.locator('#choose-song-shape').click()
 assert page.locator('#lookup-area .primary-shape').get_attribute('data-shape')==chosen
 lookup('Em9');page.locator('.primary-shape summary').click();page.locator('#chord-results [data-reset-primary]').click()
 assert page.locator('.primary-shape').get_attribute('data-shape')=='2,0,3,4'
 page.get_by_text('Busca avançada e filtros',exact=True).click();page.locator('#chord-max').fill('0');page.get_by_role('button',name='Consultar acorde',exact=True).click();assert page.locator('.primary-shape').count()==0
 page.locator('#chord-max').fill('12');page.get_by_role('button',name='Consultar acorde',exact=True).click();assert page.locator('.primary-shape').count()==1
 page.screenshot(path='/tmp/dicionario-principal.png',full_page=True)
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 print('PASS: destaque de referência, escolha pessoal, persistência entre grafias e recarga, mesma escolha nas cifras, redefinição, filtros, variações sem duplicação e tela móvel.')
 b.close()
