from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/')+'?v=0.15.0');page.get_by_role('button',name='Acordes',exact=True).click()
 assert page.locator('#chord-max').input_value()=='12'
 assert page.locator('#chord-max').get_attribute('max')=='12'
 page.locator('summary').click()
 assert page.locator('#chord-span').input_value()=='5'
 assert page.locator('#chord-rootless').is_checked()
 page.locator('#chord-symbol').fill('Asus');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('#chord-quality').input_value()=='sus4'
 a=page.locator('.chord-shape').filter(has_text='2–2–3–2')
 assert a.count()==1
 assert a.locator('.chord-barre[data-fret="2"]').count()==1
 assert a.locator('.chord-note-label').all_text_contents()==['1','1','2','1']
 page.locator('#chord-root').select_option('F#');assert page.locator('#chord-symbol').input_value()=='F#sus4'
 page.locator('#chord-quality').select_option('sus2');assert page.locator('#chord-symbol').input_value()=='F#sus2'
 assert page.locator('.chord-shape').count()>0
 page.locator('#chord-symbol').fill('C7M(b5)');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('#chord-quality').input_value()=='maj7b5'
 c=page.locator('.chord-shape').filter(has_text='4–4–5–4')
 assert 'Omitidas: C (1)' in c.inner_text()
 assert c.locator('.chord-barre[data-fret="4"]').count()==1
 assert c.locator('.chord-note-label').all_text_contents()==['1','1','2','1']
 page.locator('#chord-root-presence').select_option('absent')
 assert all('Omitidas: C (1)' in text for text in page.locator('.chord-shape').all_text_contents())
 page.locator('#chord-root-presence').select_option('present')
 assert page.locator('.chord-shape').filter(has_text='4–4–5–4').count()==0
 assert all('Todas as notas da fórmula presentes' in text for text in page.locator('.chord-shape').all_text_contents())
 page.locator('#chord-root-presence').select_option('all')
 page.locator('#chord-symbol').fill('C7(13)');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert '5–3–5–7' in page.locator('#chord-results').inner_text()
 source=page.locator('.chord-shape').filter(has_text='5–3–5–7')
 assert 'Omitidas: C (1)' in source.inner_text()
 assert source.locator('.chord-note-label').all_text_contents()==['2','1','3','4']
 page.locator('#chord-rootless').uncheck();page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert '5–3–5–7' not in page.locator('#chord-results').inner_text()
 page.locator('#chord-rootless').check()
 page.locator('#chord-symbol').fill('Em7(9)');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert '2–0–3–4' in page.locator('#chord-results').inner_text()
 e=page.locator('.chord-shape').filter(has_text='2–0–3–4')
 assert 'Omitidas: B (5)' in e.inner_text()
 assert e.locator('.chord-note-label').all_text_contents()==['1','2','3']
 page.locator('#chord-symbol').fill('Bm7(9)');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert '9–7–10–11' in page.locator('#chord-results').inner_text()
 page.locator('#chord-symbol').fill('A7(9)');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert page.locator('#chord-root').input_value()=='A';assert page.locator('#chord-quality').input_value()=='9';assert 'A9' in page.locator('#chord-results').inner_text();assert 'E (5)' in page.locator('#chord-results').inner_text()
 assert page.locator('.chord-shape').count()>0
 page.locator('#chord-symbol').fill('C');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 if page.get_by_role('button',name='Mais posições',exact=False).count():
  page.get_by_role('button',name='Mais posições',exact=False).click()
  page.get_by_role('button',name='Anteriores',exact=False).click()
 page.locator('#chord-symbol').fill('A7(9)')
 page.locator('#chord-min').fill('6');page.locator('#chord-max').fill('9');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert '7–6–8–9' in page.locator('#chord-results').inner_text()

 page.locator('#chord-omit').uncheck();page.get_by_role('button',name='Consultar acorde',exact=True).click();assert page.locator('.chord-shape').count()==0
 assert 'quatro cordas' in page.locator('#chord-results').inner_text()
 page.locator('#chord-omit').check();page.locator('#chord-min').fill('0');page.locator('#chord-max').fill('12')
 page.locator('#chord-root').select_option('D');page.locator('#chord-quality').select_option('m9');assert page.locator('#chord-symbol').input_value()=='Dm9';assert 'Dm9' in page.locator('#chord-results').inner_text()
 page.locator('#chord-symbol').fill('Am7');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 first=page.locator('.chord-shape').first
 assert '7–5–5–5' in first.inner_text()
 assert first.locator('.chord-barre[data-fret="5"]').count()==1
 assert first.locator('.chord-note-label').all_text_contents()==['3','1','1','1']
 page.locator('#chord-diagram-mode').select_option('frets')
 assert page.locator('.chord-shape').first.locator('.chord-note-label').all_text_contents()==['7','5','5','5']
 assert page.locator('.chord-shape').first.locator('.chord-barre').count()==1
 page.locator('#chord-diagram-mode').select_option('fingers')
 page.locator('#chord-symbol').fill('BM7');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 assert 'Maior com 7ª maior' in page.locator('#chord-results').inner_text()
 page.locator('#chord-results [data-chord-example="Bm7"]').click()
 assert page.locator('#chord-symbol').input_value()=='Bm7'
 assert '4–2–0–0' in page.locator('.chord-shape').first.inner_text()
 assert page.locator('.chord-shape').first.locator('.chord-note-label').all_text_contents()==['3','1']
 page.locator('#chord-order').select_option('low')
 lows=page.locator('.shape-category').all_text_contents();assert len(lows)>0
 page.locator('#chord-order').select_option('high')
 assert page.locator('.shape-category').all_text_contents()!=lows
 page.locator('#chord-order').select_option('simple')
 assert '4–2–0–0' in page.locator('.chord-shape').first.inner_text()
 page.locator('#chord-symbol').fill('inexistente');page.get_by_role('button',name='Consultar acorde',exact=True).click();assert 'Símbolo não reconhecido' in page.locator('#chord-results').inner_text()
 page.get_by_role('button',name='Repertório',exact=True).click();page.locator('#song-source').fill('A7(9)  Bm7(b5)');page.locator('#preview-chart').click();page.locator('#chart [data-lookup="A7(9)"]').click();page.locator('#choose-song-shape').click();assert 'A9' in page.locator('#lookup-area').inner_text()
 assert page.locator('#lookup-area .chord-shape').count()>0
 if page.locator('#lookup-area [data-chord-page="12"]').count():
  page.locator('#lookup-area [data-chord-page="12"]').click()
 page.locator('#transpose').select_option('2');assert page.locator('[data-lookup="B7(9)"]').count()==1
 page.get_by_role('button',name='Acordes',exact=True).click();page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 print('PASS: C7(13), Em7(9), Bm7(9), omissões por posição, Bm7 aberto, registro, limite de 12 trastes, pestanas, filtros, cifras e tela móvel.')
 b.close()
