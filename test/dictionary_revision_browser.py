from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'))
 page.get_by_role('button',name='Acordes',exact=True).click()
 assert page.get_by_text('Seu cavaquinho: 12 trastes',exact=False).count()==0
 help=page.locator('.chord-help').filter(has=page.get_by_text('Como ler os desenhos e as cifras',exact=True))
 assert help.get_attribute('open') is None
 def lookup(symbol):
  page.locator('#chord-symbol').fill(symbol);page.get_by_role('button',name='Consultar acorde',exact=True).click()
 lookup('Bbm')
 assert page.locator('.primary-shape').get_attribute('data-shape')=='3,3,2,3'
 assert page.locator('.variations-section [data-shape="8,6,6,8"]').count()==1
 page.locator('#chord-position').fill('8–6–6–8');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('.chord-shape').count()==1
 assert page.locator('.primary-shape').get_attribute('data-shape')=='8,6,6,8'
 page.locator('#chord-reset-filters').click()
 lookup('C7')
 count=page.locator('.chord-shape').count();assert count<=4
 page.get_by_text('Busca avançada e filtros',exact=True).click()
 page.locator('#chord-explore').check()
 assert page.locator('.chord-shape').count()>count
 page.locator('#chord-position').fill('2–3–1–2');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 card=page.locator('[data-shape="2,3,1,2"]');assert card.count()==1
 assert 'Omitidas: G (5)' in card.inner_text()
 page.locator('#chord-position').fill('')
 page.locator('#chord-mute').uncheck();page.locator('#chord-max').fill('2')
 page.get_by_role('button',name='Consultar acorde',exact=True).click()
 page.locator('#chord-reset-filters').click()
 assert page.locator('#chord-max').input_value()=='12'
 assert page.locator('#chord-mute').is_checked()
 for symbol in ['Fm','Fm7M','Fm7','F7','Bbm','Eb7','Ab','Db','Gm7(b5)','C7']:
  lookup(symbol);assert page.locator('.primary-shape').count()==1,symbol
 page.set_viewport_size({'width':390,'height':844})
 lookup('Bbm')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path='/tmp/dicionario-revisado-mobile.png',full_page=True)
 assert not errors,errors
 b.close()
 print('PASS: Bbm em duas regiões, busca por casas, exploração avançada, quinta omitida explícita, restauração de filtros, cifras do print, ajuda recolhida e tela móvel.')
