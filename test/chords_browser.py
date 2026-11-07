from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/')+'?v=0.7.0');page.get_by_role('button',name='Acordes',exact=True).click()
 page.locator('#chord-symbol').fill('A7(9)');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('#chord-root').input_value()=='A';assert page.locator('#chord-quality').input_value()=='9';assert 'A9' in page.locator('#chord-results').inner_text();assert 'E (5)' in page.locator('#chord-results').inner_text()
 assert page.locator('.chord-shape').count()==8
 page.get_by_role('button',name='Mais posições',exact=False).click();assert page.locator('.chord-shape').count()==2
 page.get_by_role('button',name='Anteriores',exact=False).click();assert page.locator('.chord-shape').count()==8
 page.locator('summary').click();page.locator('#chord-min').fill('6');page.locator('#chord-max').fill('9');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert '7–6–8–9' in page.locator('#chord-results').inner_text()

 page.locator('#chord-omit').uncheck();page.get_by_role('button',name='Consultar acorde',exact=True).click();assert page.locator('.chord-shape').count()==0
 assert 'quatro cordas' in page.locator('#chord-results').inner_text()
 page.locator('#chord-omit').check();page.locator('#chord-min').fill('0');page.locator('#chord-max').fill('19')
 page.locator('#chord-root').select_option('D');page.locator('#chord-quality').select_option('m9');assert page.locator('#chord-symbol').input_value()=='Dm9';assert 'Dm9' in page.locator('#chord-results').inner_text()
 page.locator('#chord-symbol').fill('Am7');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 first=page.locator('.chord-shape').first
 assert '7–5–5–5' in first.inner_text()
 assert first.locator('.chord-barre[data-fret="5"]').count()==1
 assert first.locator('.chord-note-label').all_text_contents()==['3','1','1','1']
 page.locator('#chord-diagram-mode').select_option('frets')
 assert page.locator('.chord-shape').first.locator('.chord-note-label').all_text_contents()==['7','5','5','5']
 assert page.locator('.chord-shape').first.locator('.chord-barre').count()==1
 page.locator('#chord-symbol').fill('inexistente');page.get_by_role('button',name='Consultar acorde',exact=True).click();assert 'Símbolo não reconhecido' in page.locator('#chord-results').inner_text()
 page.get_by_role('button',name='Repertório',exact=True).click();page.locator('#song-source').fill('A7(9)  Bm7(b5)');page.locator('#preview-chart').click();page.locator('[data-lookup="A7(9)"]').click();assert 'A9' in page.locator('#lookup-area').inner_text()
 page.locator('#lookup-area [data-chord-page="8"]').click();assert page.locator('#lookup-area .chord-shape').count()==2
 page.locator('#transpose').select_option('2');assert page.locator('[data-lookup="B7(9)"]').count()==1
 page.get_by_role('button',name='Acordes',exact=True).click();page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 print('PASS: A7(9), equivalência A9, omissão explícita, posição 7–6–8–9, paginação, filtros, pesquisa pelos seletores, erro de símbolo, consulta na cifra, transposição e viewport móvel.')
 b.close()
