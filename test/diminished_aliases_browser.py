from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'))
 page.get_by_role('button',name='Acordes',exact=True).click()
 page.locator('#chord-symbol').fill('C#º');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('#chord-quality').input_value()=='dim'
 assert page.locator('.primary-shape').count()==1
 assert 'C# (1)' in page.locator('#chord-results').inner_text()
 page.get_by_role('button',name='Diminuto com 7ª · 4 notas',exact=True).click()
 assert page.locator('#chord-symbol').input_value()=='C#dim7'
 assert page.locator('#chord-quality').input_value()=='dim7'
 assert 'Bb (bb7)' in page.locator('#chord-results').inner_text()
 assert page.locator('[data-shape="2,3,2,5"]').count()==1
 page.locator('#chord-results').screenshot(path='/tmp/do-sustenido-diminuto-com-setima.png')
 page.locator('#chord-symbol').fill('C#º7');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('#chord-quality').input_value()=='dim7'
 page.get_by_role('button',name='Repertório',exact=True).click()
 source='F | C7 | C#º | Dm\nA7 | D7 | G7\nGm | C7'
 page.locator('#song-source').fill(source);page.locator('#preview-chart').click()
 chord=page.locator('#chart [data-lookup="C#°"]');assert chord.count()==1
 chord.click();assert page.locator('#popover-content svg').count()==1
 assert page.locator('#song-source').input_value()==source
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 b.close()
 print('PASS: C#º encontrado, escolha explícita entre três/quatro notas, º7 reconhecido, diagrama na cifra e texto original preservado.')
