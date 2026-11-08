from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'));page.get_by_role('button',name='Acordes',exact=True).click()
 for symbol in ['Eb7(9)','Bbm6','Am','C7M(b5)','A7(9)']:
  page.locator('#chord-symbol').fill(symbol);page.get_by_role('button',name='Consultar acorde',exact=True).click()
  assert 1<=page.locator('.chord-shape').count()<=4,symbol
  assert page.get_by_role('button',name='Mostrar todas as',exact=False).count()==0
  assert 'combinações calculadas' not in page.locator('#chord-results').inner_text()
 page.locator('#chord-symbol').fill('Eb7(9)');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('[data-shape="3,3,2,5"]').count()==1
 page.locator('#chord-results').screenshot(path='/tmp/eb9-selecao-estudo.png')
 page.get_by_text('Busca avançada e filtros',exact=True).click();page.locator('#chord-explore').check()
 assert page.locator('.chord-shape').count()==13
 assert 'Pesquisa avançada' in page.locator('#chord-results').inner_text()
 page.get_by_role('button',name='Mais posições',exact=False).click()
 assert page.locator('.chord-shape').count()<=13
 page.locator('#chord-reset-filters').click();assert not page.locator('#chord-explore').is_checked()
 assert page.locator('.chord-shape').count()<=4
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.locator('#chord-results').screenshot(path='/tmp/eb9-selecao-estudo-mobile.png')
 page.get_by_role('button',name='Repertório',exact=True).click()
 page.locator('#song-source').fill('Eb7(9)  Bbm6');page.locator('#preview-chart').click()
 page.locator('#chart [data-lookup="Eb7(9)"]').click()
 assert page.locator('#lookup-area .chord-shape').count()<=4
 assert not errors,errors
 b.close()
 print('PASS: poucas formas na consulta e nas cifras, alternativas úteis de Eb9, exploração explícita/paginada, restauração do padrão e tela móvel.')
