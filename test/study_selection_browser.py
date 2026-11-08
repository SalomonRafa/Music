from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'));page.get_by_role('button',name='Acordes',exact=True).click()
 def lookup(symbol):
  page.locator('#chord-symbol').fill(symbol);page.get_by_role('button',name='Consultar acorde',exact=True).click()
 lookup('Bbm')
 assert page.locator('.chord-shape:visible').count()==5
 for frets in ['3,3,2,3','8,6,6,8','11,10,11,11','8,10,11,11','11,10,11,8']:
  assert page.locator('[data-shape="'+frets+'"]').is_visible()
 page.locator('#chord-results').screenshot(path='/tmp/bbm-formas-restauradas.png')
 lookup('Eb7(9)')
 assert page.locator('.chord-shape').count()==10
 assert page.locator('.chord-shape:visible').count()==6
 page.get_by_text('Mais formas do acorde (4)',exact=True).click()
 assert page.locator('.chord-shape:visible').count()==10
 assert page.get_by_role('button',name='Mostrar todas as',exact=False).count()==0
 assert 'combinações calculadas' not in page.locator('#chord-results').inner_text()
 page.get_by_text('Busca avançada e filtros',exact=True).click();page.locator('#chord-explore').check()
 assert page.locator('.chord-shape').count()==13
 page.get_by_role('button',name='Mais posições',exact=False).click()
 assert page.locator('.chord-shape').count()<=13
 page.locator('#chord-reset-filters').click();assert not page.locator('#chord-explore').is_checked()
 assert page.locator('.chord-shape').count()==10
 page.set_viewport_size({'width':390,'height':844});lookup('Bbm')
 assert page.locator('.chord-shape:visible').count()==5
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.get_by_role('button',name='Repertório',exact=True).click()
 page.locator('#song-source').fill('Bbm  Eb7(9)');page.locator('#preview-chart').click()
 page.locator('#chart [data-lookup="Bbm"]').click()
 assert page.locator('#lookup-area .chord-shape').count()==5
 assert not errors,errors
 b.close()
 print('PASS: cinco Bbm restaurados; dez Eb9 acessíveis sem busca avançada; expansão sem perder formas; exploração separada; restauração, cifras e celular.')
