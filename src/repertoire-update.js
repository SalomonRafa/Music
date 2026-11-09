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

[G7M]Você me tem[Am] fácil demais [Dm7]
[G7(13)]Mas não p[C7M]arece capaz
[Cm6]De cuidar do qu[G7M]e pos[D4]sui [D]
[G7M]Você sorri[Am]u e me propô[Dm7]s
[G7(13)]Que eu te [C7M]deixasse em paz
[Cm6]Me disse vai,[G7M] eu não fui

[C7M]Não faça ass[Cm6]im
[G7M]Não faça [A/C#]nada por[C7M] mim
[Cm6]Não vá pe[F7(9)]nsando [G7M]que eu sou seu

[G7M]Você me di[Am]z o que faze[Dm7]r
[G7(13)]Mas não pro[A/C#]cura entender
[Cm6]Que eu faço só p[G7M]ra te[D4] agr[D]adar

[G7M]Me diz até[Am] o que vestir[Dm7]
[G7(13)]Com quem andar[C7M] e aonde ir
[Cm6]E não me ped[G7M]e pra voltar

[Em]Não faça as[Em/Eb]sim
[Em/D]Não faça n[C#m7(5-)]ada por m[C7M]im
[Cm6]Não vá p[F7(9)]ensando [G7M]que eu sou seu

[Em]Não faça as[Em/Eb]sim
[Em/D]Não faça na[C#m7(5-)]da por mim[C7M]
[Cm6] [F7(9)] [G7M]`,
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
