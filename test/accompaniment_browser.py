from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/'))
 page.get_by_role('button',name='Acordes',exact=True).click()
 page.locator('#chord-symbol').fill('Dm7/G');page.get_by_role('button',name='Consultar acorde',exact=True).click()
 card=page.locator('[data-shape="3,5,3,5"]');assert card.count()==1;assert 'Baixo G no acompanhamento' in card.inner_text();assert card.locator('.chord-note-label').all_text_contents()==['1','3','1','4']
 card.locator('[data-set-primary]').click();assert page.locator('.primary-shape').get_attribute('data-shape')=='3,5,3,5'
 page.get_by_role('button',name='Repertório',exact=True).click()
 page.locator('#saved-songs').select_option('voo-pro-japao')
 strip=page.locator('#song-diagrams [data-open-chord="Dm7/G"]');assert '3–5–3–5' in strip.inner_text();assert 'Baixo G no acompanhamento' in strip.inner_text()
 page.locator('#chart [data-lookup="Dm7/G"]').click();assert 'Casas: 3–5–3–5' in page.locator('#popover-content').inner_text();assert 'Baixo G no acompanhamento' in page.locator('#popover-content').inner_text()
 assert page.locator('#lookup-area .primary-shape').get_attribute('data-shape')=='3,5,3,5'
 page.locator('#close-chord-popover').click();page.locator('#lookup-area .primary-shape').screenshot(path='/tmp/voo-video-review/dm7g-no-app.png')
 page.reload();page.get_by_role('button',name='Repertório',exact=True).click();page.locator('#saved-songs').select_option('voo-pro-japao');assert '3–5–3–5' in page.locator('#song-diagrams [data-open-chord="Dm7/G"]').inner_text()
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert not errors,errors
 b.close();print('PASS: dicionário, principal pessoal, cifra, popup, origem do baixo, persistência e celular.')
