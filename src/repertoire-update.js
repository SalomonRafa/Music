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
