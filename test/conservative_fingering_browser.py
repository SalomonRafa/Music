from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'))
 page.get_by_role('button',name='Acordes',exact=True).click()
 page.locator('#chord-symbol').fill('Dm');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 main=page.locator('.primary-shape');assert main.get_attribute('data-shape')=='3,2,3,3'
 assert main.locator('.chord-note-label').all_text_contents()==['2','1','3','4']
 assert main.locator('.chord-barre').count()==0
 main.locator('summary').click();assert 'Imagem de Dm' in main.inner_text();main.locator('summary').click()
 main.screenshot(path='/tmp/dm-referencia-sem-meia-pestana.png')
 high=page.locator('[data-shape="7,7,6,7"]');assert high.count()==1
 page.locator('.more-chord-shapes > summary').click()
 high.locator('[data-set-primary]').click();assert page.locator('.primary-shape').get_attribute('data-shape')=='7,7,6,7'
 page.locator('.primary-shape summary').click();page.locator('[data-reset-primary]').click()
 assert page.locator('.primary-shape').get_attribute('data-shape')=='3,2,3,3'
 for symbol in ['Bbm','Bbm6','Dm','Eb9','C7','C#dim7','Asus4','Am7','Fmaj7']:
  page.locator('#chord-symbol').fill(symbol);page.get_by_role('button',name='Consultar acorde',exact=True).click()
  for svg in page.locator('#chord-results .chord-shape svg').all():
   labels=svg.locator('.chord-note-label').all_text_contents()
   for finger in ['2','3','4']:assert labels.count(finger)<=1,(symbol,labels)
 page.get_by_role('button',name='Repertório',exact=True).click()
 page.locator('#song-source').fill('Dm  Bbm6  Am7');page.locator('#preview-chart').click()
 strip=page.locator('#song-diagrams [data-open-chord="Dm"]')
 assert strip.locator('.chord-note-label').all_text_contents()==['2','1','3','4']
 page.locator('#chart [data-lookup="Dm"]').click()
 assert page.locator('#popover-content .chord-note-label').all_text_contents()==['2','1','3','4']
 assert page.locator('#popover-content .chord-barre').count()==0
 assert page.locator('#lookup-area .primary-shape .chord-note-label').all_text_contents()==['2','1','3','4']
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 b.close()
 print('PASS: Dm baixo com dedos 2–1–3–4; forma alta disponível; preferência/restauração; nenhuma repetição de dedos 2/3/4 nas consultas; cifra e celular.')
