from playwright.sync_api import sync_playwright
import os
source='Intro:|G#|Cm7|Fm7|G#7(4/9)| 2x\nLinha de estudo\nCm7 Calt Fm7\nC#9D#9\n[Am7]linha [Dm7]teste [G7]fim\n'+'\n'.join('Cm7   Fm7   G#7(9)\nLinha '+str(i) for i in range(16))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000},has_touch=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('APP_URL','http://127.0.0.1:3000/')+'?v=0.15.0');page.get_by_role('button',name='Repertório',exact=True).click()
 page.locator('#song-source').fill(source);page.locator('#preview-chart').click()
 buttons=page.locator('#chart [data-lookup]');count=buttons.count();assert count>50
 # Clique em cada ocorrência enquanto o desenho anterior permanece aberto.
 for i in range(count):
  button=buttons.nth(i);symbol=button.get_attribute('data-lookup');button.click()
  assert page.locator('#popover-title').inner_text()==symbol
  assert page.locator('#chord-popover').is_visible()
  if symbol!='Calt':assert page.locator('#popover-content svg').count()==1
  else:assert page.locator('#popover-content svg').count()==0
  assert button.get_attribute('aria-pressed')=='true'
 assert page.locator('#chart').evaluate('(e)=>e.scrollTop')>0
 page.locator('#chart').evaluate('(e)=>e.scrollTop=0');assert page.locator('#chord-popover').is_visible()
 # Repete a navegação por toque no layout móvel sem janela sobreposta.
 page.set_viewport_size({'width':390,'height':844})
 for i in [0,1,2,3,5,6,7,8,9,count-1]:
  button=buttons.nth(i);symbol=button.get_attribute('data-lookup');button.tap()
  assert page.locator('#popover-title').inner_text()==symbol
  panel=page.locator('#chord-popover').bounding_box();chart=page.locator('#chart').bounding_box()
  assert panel['y']+panel['height']<=chart['y']+1
  assert panel['x']>=0 and panel['x']+panel['width']<=391
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path='/tmp/cifra-todos-acordes.png')
 assert not errors,errors
 print(f'PASS: {count} ocorrências clicáveis durante rolagem, barras, repetição, símbolo desconhecido isolado, acordes colados, ChordPro, painel persistente e toques em tela móvel.')
 b.close()
