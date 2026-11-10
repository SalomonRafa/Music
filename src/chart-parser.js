import {parseChord} from './harmony.js?v=0.19.0';
const separators=/^[()|│┃‖:%,;·•/\-]+$/;
const annotation=/^(?:\(?\d+x\)?|\(?x\d+\)?|intro(?:dução)?:?|refr[aã]o:?|ponte:?|verso:?|estrofe:?|solo:?|tom:?|parte:?|final:?)$/i;
export function looksLikeChord(value){return /^[A-G][#b]?(?:(?:m|maj|M|dim|aug|sus|add|no|omit|alt)|[0-9#b+(),/°ºᵒ˚oøΔ-])*(?:\/[A-G][#b]?)?$/.test(value);}
function splitJoined(value){if(parseChord(value))return [value];let depth=0,start=0,parts=[];for(let i=0;i<value.length;i++){const c=value[i];if(c==='(')depth++;if(c===')')depth--;if(i>0&&depth===0&&/[A-G]/.test(c)&&value[i-1]!=='/'){parts.push(value.slice(start,i));start=i;}}parts.push(value.slice(start));return parts.length>1&&parts.every(p=>parseChord(p))?parts:[value];}
function tokenParts(value){let core=value,repeat='';const suffix=/\((?:\d+x|x\d+)\)$/.exec(core);if(suffix){repeat=suffix[0];core=core.slice(0,-repeat.length);}const chunks=[];let depth=0,start=0;for(let i=0;i<core.length;i++){if(core[i]==='(')depth++;if(core[i]===')')depth--;if(depth===0&&/[|│┃‖:%,;·•]/.test(core[i])){if(i>start)chunks.push(core.slice(start,i));chunks.push(core[i]);start=i+1;}}if(start<core.length)chunks.push(core.slice(start));const out=[];
 for(let chunk of chunks){if(separators.test(chunk)){out.push({type:'text',value:chunk});continue;}let enclosed=false;if(chunk.startsWith('(')&&chunk.endsWith(')')&&parseChord(chunk.slice(1,-1))){enclosed=true;out.push({type:'text',value:'('});chunk=chunk.slice(1,-1);}for(const p of splitJoined(chunk)){if(parseChord(p))out.push({type:'candidate',symbol:p,recognized:true});else if(looksLikeChord(p)&&p.length>1)out.push({type:'candidate',symbol:p,recognized:false});else out.push({type:'text',value:p});}if(enclosed)out.push({type:'text',value:')'});}
 if(repeat)out.push({type:'text',value:repeat});return out;
}
export function parseChartLines(text){return String(text).replace(/\r\n?/g,'\n').split('\n').map(line=>{
 if(/^\s*\{.*\}\s*$/.test(line)){const m=/\{(?:title|t|subtitle|st|artist):\s*(.*?)\}/i.exec(line);return {kind:'heading',text:m?m[1]:'',segments:[]};}
 const bracket=[...line.matchAll(/\[([^\]]+)\]/g)];if(bracket.length){const segments=[];let pos=0,hasChord=false;for(const m of bracket){if(m.index>pos)segments.push({type:'text',value:line.slice(pos,m.index)});const value=m[1];if(parseChord(value)||looksLikeChord(value)){segments.push({type:'chord',symbol:value,recognized:!!parseChord(value)});hasChord=true;}else segments.push({type:'text',value:m[0]});pos=m.index+m[0].length;}if(pos<line.length)segments.push({type:'text',value:line.slice(pos)});return {kind:'line',chordpro:hasChord,segments};}
 const parts=line.split(/(\s+)/).filter(Boolean).flatMap(p=>/^\s+$/.test(p)?[{type:'text',value:p}]:tokenParts(p));
 const chordLine=parts.some(p=>p.type==='candidate')&&parts.every(p=>p.type==='candidate'||!p.value.trim()||separators.test(p.value)||annotation.test(p.value));
 return {kind:'line',chordpro:false,segments:parts.map(p=>p.type!=='candidate'?p:chordLine||p.symbol.length>1?{...p,type:'chord'}:{type:'text',value:p.symbol})};
 });}
export function extractChartChords(text){const seen=new Set();for(const line of parseChartLines(text))for(const s of line.segments)if(s.type==='chord')seen.add(s.symbol);return [...seen];}
