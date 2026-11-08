from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'))
 page.get_by_role('button',name='Acordes',exact=True).click()
 page.locator('#chord-symbol').fill('Bbm6');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('.primary-shape').get_attribute('data-shape')=='3,3,2,5'
 primary=page.locator('.primary-shape').bounding_box();first=page.locator('.variations-section .chord-shape').first.bounding_box()
 assert abs(primary['y']-first['y'])<2,(primary,first)
 assert abs(primary['width']-first['width'])<2
 assert primary['height']<420,primary
 assert page.locator('.primary-section>h2').count()==0
 assert page.locator('.primary-section>p').count()==0
 assert page.locator('.primary-shape details').get_attribute('open') is None
 assert 'Registro:' not in page.locator('.primary-shape').inner_text()
 page.locator('.primary-shape summary').click()
 assert 'Notas: F–Bb–Db–G' in page.locator('.primary-shape').inner_text()
 page.locator('.primary-shape summary').click()
 page.locator('#chord-results').screenshot(path='/tmp/acordes-compactos-desktop.png')
 page.set_viewport_size({'width':390,'height':844})
 primary=page.locator('.primary-shape').bounding_box();first=page.locator('.variations-section .chord-shape').first.bounding_box()
 assert abs(primary['y']-first['y'])<2,(primary,first)
 assert primary['width']<200
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.locator('.chord-position-grid').screenshot(path='/tmp/acordes-compactos-mobile.png')
 page.locator('#chord-symbol').fill('C7');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 page.get_by_role('button',name='Mostrar todas as',exact=False).click()
 card=page.locator('[data-shape="2,3,1,2"]');assert 'Omitidas: G (5)' in card.inner_text()
 assert not errors,errors
 b.close()
 print('PASS: principal e variações na mesma linha e largura; sem painel vazio; detalhes recolhidos; Bbm6 correto; duas colunas móveis; omissões visíveis.')
