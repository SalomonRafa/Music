import {songShapeKey} from './song-arrangement.js?v=0.19.0';
export let migratedSongId=null;
export async function migrateAindaBem(storage,subtle=globalThis.crypto?.subtle){
 if(!subtle)return null;
 try{
 const key='mestre-songbook-v1',raw=storage.getItem(key),songs=JSON.parse(raw||'[]');
 if(!Array.isArray(songs))return null;
 for(const song of songs){
 if(typeof song.text!=='string'||typeof song.id!=='string'||song.referenceIntroApplied)continue;
 const bytes=await subtle.digest('SHA-256',new TextEncoder().encode(song.text.replace(/\r\n/g,'\n').trim()));
 const hash=Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
 if(hash!=="1bcb6a0c24d7cb6f0ae7de6578288abd5626c8641e1f15722a6f2640ea3e29b8")continue;
 // Do not overwrite edits made while the digest was being computed.
 if(storage.getItem(key)!==raw)return null;
 const backupKey='mestre-song-backup-ainda-bem-v1';
 if(!storage.getItem(backupKey))storage.setItem(backupKey,JSON.stringify(song));
 const updated={...song,text:"{subtitle: Introdução instrumental proposta em Lá — estudo inspirado na imagem}\nA    C#m7    Bm7    C#m7    D7M\n{subtitle: Último acorde da imagem ainda não confirmado; retornar à cifra original abaixo.}\n{subtitle: Esta proposta não transcreve a melodia nem o ritmo do vídeo.}\n\n"+song.text,referenceIntroApplied:true};
 const next=songs.map(s=>s===song?updated:s);
 storage.setItem(key,JSON.stringify(next));migratedSongId=song.id;return song.id;
 }
 }catch{}
 return null;
}

export const nadaPorMim={
 id:'nada-por-mim-encontro-de-batuqueiros',
 title:'Nada por mim — Encontro de Batuqueiros',
 text:`{title: Nada por mim}
{subtitle: Versão Encontro de Batuqueiros}
{key: G}

[G7M]Você me tem[Am7] fácil demais [Dm]
[G7(13)]Mas não p[C7M]arece capaz
[Cm6]De cuidar do qu[G7M]e pos[D4]sui [D]
[G7M]Você sorri[Am7]u e me propô[Dm]s
[G7(13)]Que eu te [C7M]deixasse em paz
[Cm6]Me disse vai,[G7M] eu não fui

[C7M]Não faça ass[Cm6]im
[G7M]Não faça [A/C#]nada por[C7M] mim
[Cm6]Não vá pe[F7(9)]nsando [G7M]que eu sou seu

[G7M]Você me di[Am7]z o que faze[Dm]r
[G7(13)]Mas não pro[A/C#]cura entender
[Cm6]Que eu faço só p[G7M]ra te[D4] agr[D]adar

[G7M]Me diz até[Am7] o que vestir[Dm]
[G7(13)]Com quem andar[C7M] e aonde ir
[Cm6]E não me ped[G7M]e pra voltar

[Em]Não faça as[Em/Eb]sim
[Em/D]Não faça n[C#m7(5-)]ada por m[C7M]im
[Cm6]Não vá p[F7(9)]ensando [G7M]que eu sou seu

[Em]Não faça as[Em/Eb]sim
[Em/D]Não faça na[C#m7(5-)]da por mim[C7M]
[Cm6]Não vá p[F7(9)]ensando [G7M]que eu sou seu`,
 arrangement:{shapes:{},transpose:0}
};
export function addNadaPorMim(storage){
 const key='mestre-songbook-v1',marker='mestre-added-nada-por-mim-v1';
 try{
  if(storage.getItem(marker))return null;
  const raw=storage.getItem(key),songs=JSON.parse(raw||'[]');
  if(!Array.isArray(songs))return null;
  // Preserve existing text, arrangements and intentional deletions after import.
  if(!songs.some(s=>s?.id===nadaPorMim.id))storage.setItem(key,JSON.stringify([...songs,nadaPorMim]));
  storage.setItem(marker,'1');
  return nadaPorMim.id;
 }catch{return null;}
}

export function correctNadaPorMim(storage){
 const key='mestre-songbook-v1';
 try{
  const songs=JSON.parse(storage.getItem(key)||'[]');
  if(!Array.isArray(songs))return false;
  let changed=false;
  const next=songs.map(song=>{
   if(song?.id!==nadaPorMim.id||song.nadaPorMimAm7Corrected||typeof song.text!=='string')return song;
   // Change chord tokens only; preserve lyrics, other songs and saved arrangements.
   let text=song.text.replace(/\[Am\]/g,'[Am7]');
   const oldEnding='[Cm6] [F7(9)] [G7M]';
   if(text.trimEnd().endsWith(oldEnding))text=text.trimEnd().slice(0,-oldEnding.length)+'[Cm6]Não vá p[F7(9)]ensando [G7M]que eu sou seu';
   const backup='mestre-song-backup-nada-por-mim-am7-v1';
   if(!storage.getItem(backup))storage.setItem(backup,JSON.stringify(song));
   changed=true;return {...song,text,nadaPorMimAm7Corrected:true};
  });
  if(changed)storage.setItem(key,JSON.stringify(next));
  return changed;
 }catch{return false;}
}

export function correctNadaPorMimDm(storage){
 const key='mestre-songbook-v1';
 try{
  const songs=JSON.parse(storage.getItem(key)||'[]');
  if(!Array.isArray(songs))return false;
  let changed=false;
  const next=songs.map(song=>{
   if(song?.id!==nadaPorMim.id||song.nadaPorMimDmCorrected||typeof song.text!=='string')return song;
   const backup='mestre-song-backup-nada-por-mim-dm-v1';
   if(!storage.getItem(backup))storage.setItem(backup,JSON.stringify(song));
   changed=true;
   return {...song,text:song.text.replace(/\[Dm7\]/g,'[Dm]'),nadaPorMimDmCorrected:true};
  });
  if(changed)storage.setItem(key,JSON.stringify(next));
  return changed;
 }catch{return false;}
}

export const vooProJapaoTrecho2='{subtitle: Trecho 2 — transcrito do print enviado}\n[Dm7(b5)] | [B°] | [Eb7M] > [Bb] > [F#°] > [Gm7] | [Cm7] | [D/C] |';
export const vooProJapaoTrecho3='{subtitle: Trecho 3 — transcrito do print enviado}\n[Bm7] > [Bbm7] | [Bbm6] | [Gb7M] | [Gb/Ab] |\n[Db7M] | [Db/Gb] | [Cm7(b5)] | [Eb/F] |';
export const vooProJapaoTrecho4='{subtitle: Trecho 4 — transcrito do print enviado}\n[Bm7] > [Bbm7] | [Bbm6] | [Gb7M] | [Ebm7/Ab] | [Db7M] |\n[E] > [Eb] > [D] > [Db/Gb] | [F7/4] | [Cm7(b5)] > [F7] |';
export const vooProJapaoTrecho5='{subtitle: Trecho 5 — transcrito do print enviado}\n[Bb7M] | [Bb6/9] | [Eb7/13] | [Gb/Ab] | [Db7M] | [Gb7M] | [F7/4] | % |\n[Bb7M] | [Bb6/9] | [Eb7/13] | [Gb/Ab] | [Db7M] | [Gb7M] | [F7/4] | % |';
export const vooProJapaoSemLetra={
 id:'voo-pro-japao',
 title:'Voo pro Japão',
 text:`{title: Voo pro Japão}
{subtitle: Trecho 1 — transcrito do print enviado}
[Bb7M] | % | [Dm7/G] | [Cm7/F] | [Bb7M] | [Bb7M] >[D7(#9)] |
[Fm7] | [Bb7/13] | [Eb7M] | % | [Cm6] | [Am7(b5)] | [Fm6] | % |\n\n${vooProJapaoTrecho2}\n\n${vooProJapaoTrecho3}\n\n${vooProJapaoTrecho4}\n\n${vooProJapaoTrecho5}`,
 arrangement:{shapes:{},transpose:0},
 importedSections:['print-1','print-2','print-3','print-4','print-5']
};
// Letter placement follows the supplied lyric chart; chord sequence and
// repeat/passing markers remain those transcribed from the five screenshots.
export const vooProJapao={
 ...vooProJapaoSemLetra,
 arrangement:{shapes:{[songShapeKey('Bb7M')]:[3,3,3,7],[songShapeKey('Dm7/G')]:[3,5,3,5]},transpose:0},
 videoDm7GApplied:true,
 lyricsApplied:true,
 text:`{title: Voo pro Japão}
{subtitle: Tom: Bb}

[Bb7M]Marque um lugar pra gente se amar | % |
[Dm7/G]como antes | [Cm7/F] |
[Bb7M]Vou te buscar | [Bb7M]não dá para viver >[D7(#9)] |
[Fm7]tão distante | [Bb7/13] |
[Eb7M]Desse brilho no olhar | % | [Cm6]no meu | [Am7(b5)]amanhecer | [Fm6] | % |

[Dm7(b5)]Do seu jeito amar, desse nosso | [B°]querer |
[Eb7M]Que saudade que dá > [Bb] > [F#°] > [Gm7]me lembrar | [Cm7]de você | [D/C] |

[Bm7] > [Bbm7]Do último voo pro | [Bbm6]Japão |
[Gb7M]Da primeira transa no avião | [Gb/Ab] |
[Db7M]Foi demais | [Db/Gb] |
[Cm7(b5)]Foi tudo tão | [Eb/F]lindo |

[Bm7] > [Bbm7]Quero voar com você | [Bbm6]dessa vez pro infinito |
[Gb7M]E pousar no prazer | [Ebm7/Ab] | [Db7M] |
[E] > [Eb] > [D] > [Db/Gb] |
[F7/4]Repousar com você, meu amor | [Cm7(b5)] > [F7] |

[Bb7M]É de manhã | [Bb6/9]A lua vai, o sol vem |
[Eb7/13]Surgindo, trazendo um novo | [Gb/Ab] |
[Db7M]Amanhecer da noite | [Gb7M]que passei |
[F7/4]Sem dormir | % |

[Bb7M]É de manhã | [Bb6/9]É tudo tão sem graça |
[Eb7/13]Para mim | [Gb/Ab] |
[Db7M]E nada de você dá sinal | [Gb7M]Mais sei que o nosso amor não tem |
[F7/4]Fim | % |`
};

export function addVooProJapao(storage){
 const key='mestre-songbook-v1',marker='mestre-added-voo-pro-japao-print-1-v1';
 try{
  if(storage.getItem(marker))return null;
  const songs=JSON.parse(storage.getItem(key)||'[]');
  if(!Array.isArray(songs))return null;
  if(!songs.some(s=>s?.id===vooProJapao.id))storage.setItem(key,JSON.stringify([...songs,vooProJapao]));
  storage.setItem(marker,'1');
  return vooProJapao.id;
 }catch{return null;}
}

export function appendVooProJapaoTrecho2(storage){
 const key='mestre-songbook-v1';
 try{
  const songs=JSON.parse(storage.getItem(key)||'[]');
  if(!Array.isArray(songs))return false;
  let changed=false;
  const next=songs.map(song=>{
   if(song?.id!==vooProJapao.id||typeof song.text!=='string'||song.importedSections?.includes('print-2'))return song;
   const backup='mestre-song-backup-voo-pro-japao-before-print-2-v1';
   if(!storage.getItem(backup))storage.setItem(backup,JSON.stringify(song));
   changed=true;
   return {...song,text:song.text.includes(vooProJapaoTrecho2)?song.text:song.text.trimEnd()+'\n\n'+vooProJapaoTrecho2,importedSections:[...(Array.isArray(song.importedSections)?song.importedSections:[]),'print-2']};
  });
  if(changed)storage.setItem(key,JSON.stringify(next));
  return changed;
 }catch{return false;}
}

export function appendVooProJapaoRemaining(storage){
 const key='mestre-songbook-v1';
 const sections=[['print-3',vooProJapaoTrecho3],['print-4',vooProJapaoTrecho4],['print-5',vooProJapaoTrecho5]];
 try{
  const songs=JSON.parse(storage.getItem(key)||'[]');
  if(!Array.isArray(songs))return false;
  let changed=false;
  const next=songs.map(song=>{
   if(song?.id!==vooProJapao.id||typeof song.text!=='string')return song;
   const imported=Array.isArray(song.importedSections)?[...song.importedSections]:[];
   const missing=sections.filter(([id])=>!imported.includes(id));
   if(!missing.length)return song;
   const backup='mestre-song-backup-voo-pro-japao-before-prints-3-5-v1';
   if(!storage.getItem(backup))storage.setItem(backup,JSON.stringify(song));
   let text=song.text;
   for(const [id,section] of missing){if(!text.includes(section))text=text.trimEnd()+'\n\n'+section;imported.push(id);}
   changed=true;return {...song,text,importedSections:imported};
  });
  if(changed)storage.setItem(key,JSON.stringify(next));
  return changed;
 }catch{return false;}
}

export function addVooProJapaoLyrics(storage){
 const key='mestre-songbook-v1';
 try{
  const songs=JSON.parse(storage.getItem(key)||'[]');
  if(!Array.isArray(songs))return false;
  let changed=false;
  const next=songs.map(song=>{
   if(song?.id!==vooProJapao.id||song.lyricsApplied||typeof song.text!=='string')return song;
   const backup='mestre-song-backup-voo-pro-japao-before-lyrics-v1';
   if(!storage.getItem(backup))storage.setItem(backup,JSON.stringify(song));
   changed=true;return {...song,text:vooProJapao.text,lyricsApplied:true};
  });
  if(changed)storage.setItem(key,JSON.stringify(next));
  return changed;
 }catch{return false;}
}

export function applyVooVideoDm7G(storage){
 const key='mestre-songbook-v1';
 try{
  const songs=JSON.parse(storage.getItem(key)||'[]');
  if(!Array.isArray(songs))return false;
  let changed=false;
  const next=songs.map(song=>{
   if(song?.id!==vooProJapao.id||song.videoDm7GApplied)return song;
   const backup='mestre-song-backup-voo-pro-japao-before-video-dm7g-v1';
   if(!storage.getItem(backup))storage.setItem(backup,JSON.stringify(song));
   changed=true;
   return {...song,videoDm7GApplied:true,arrangement:{...song.arrangement,shapes:{...song.arrangement?.shapes,[songShapeKey('Bb7M')]:[3,3,3,7],[songShapeKey('Dm7/G')]:[3,5,3,5]}}};
  });
  if(changed)storage.setItem(key,JSON.stringify(next));
  return changed;
 }catch{return false;}
}
