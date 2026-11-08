from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'))
 page.get_by_role('button',name='Acordes',exact=True).click()
 def query(symbol):
  page.locator('#chord-symbol').fill(symbol);page.get_by_role('button',name='Consultar acorde',exact=True).click()
 for symbol,frets,fingers in [
  ('Dm','3,2,3,3',['2','1','3','4']),('Fm','3,1,1,3',['3','1','2','4']),
  ('Gm','5,3,3,5',['3','1','2','4']),('F#m','4,2,2,4',['3','1','2','4']),
  ('C#m','2,1,2,2',['2','1','3','4']),('A7','2,0,2,2',['2','3','4']),
  ('C7','5,3,5,5',['2','1','3','4']),('B7','4,2,4,4',['2','1','3','4']),
  ('G7','3,4,3,5',['1','3','2','4'])]:
  query(symbol);main=page.locator('.primary-shape');assert main.get_attribute('data-shape')==frets,symbol
  assert main.locator('.chord-note-label').all_text_contents()==fingers,symbol
  assert main.locator('.chord-barre').count()==0,symbol
 query('C7');assert 'Omitidas: C (1)' in page.locator('.primary-shape').inner_text()
 page.locator('.primary-shape summary').click();assert 'Betto Correa' in page.locator('.primary-shape').inner_text()
 query('Fm');page.locator('#chord-results').screenshot(path='/tmp/fm-conferido-apostila.png')
 query('G#7');assert page.locator('[data-shape="4,5,4,6"]').count()==1
 page.locator('.primary-shape summary').click();assert '1–3–2–4' in page.locator('.primary-shape').inner_text()
 query('F#m75-');assert page.locator('#chord-quality').input_value()=='m7b5'
 assert page.locator('[data-shape="4,2,1,2"]').count()==1
 assert page.locator('[data-shape="3,2,1,2"]').count()==0
 page.get_by_role('button',name='Repertório',exact=True).click()
 source='Dm  Fm  C7  A7  F#m75-';page.locator('#song-source').fill(source);page.locator('#preview-chart').click()
 page.locator('#chart [data-lookup="Fm"]').click()
 assert page.locator('#popover-content .chord-note-label').all_text_contents()==['3','1','2','4']
 assert page.locator('#popover-content .chord-barre').count()==0
 assert page.locator('#song-source').input_value()==source
 assert page.locator('#chart [data-lookup="F#m75-"]').count()==1
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 b.close()
 print('PASS: principais da apostila com dedos exatos, omissões visíveis, fonte, alternativa de digitação sem duplicar acorde, erro do PDF excluído, grafia legada, cifra e celular.')
