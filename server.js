import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root)||!['/index.html','/src/app.js','/src/domain.js','/src/audio.js','/src/instrument.js','/src/chord-listener.js','/src/chords.js','/src/shape-priority.js','/src/chord-presentation.js','/src/fingering.js','/src/harmony.js','/src/repertoire-update.js','/src/songbook.js','/src/chart-parser.js','/src/song-arrangement.js','/src/style.css'].includes(pathname==='/'?'/index.html':pathname)){res.writeHead(404);res.end('Não encontrado');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-cache'});res.end(await readFile(file));
  }catch {res.writeHead(404);res.end('Não encontrado');}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Mestre de Cavaquinho iniciado na porta '+(process.env.PORT||3000)));
