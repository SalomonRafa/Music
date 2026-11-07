export const names=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
export const qualities={
 '':{label:'Maior',intervals:[0,4,7]},m:{label:'Menor',intervals:[0,3,7]},'7':{label:'Dominante com 7ª',intervals:[0,4,7,10]},maj7:{label:'Maior com 7ª maior',intervals:[0,4,7,11]},m7:{label:'Menor com 7ª',intervals:[0,3,7,10]},'6':{label:'Maior com 6ª',intervals:[0,4,7,9]},m6:{label:'Menor com 6ª',intervals:[0,3,7,9]},dim:{label:'Diminuto',intervals:[0,3,6]},dim7:{label:'Diminuto com 7ª',intervals:[0,3,6,9]},m7b5:{label:'Meio-diminuto',intervals:[0,3,6,10]},aug:{label:'Aumentado',intervals:[0,4,8]},sus2:{label:'Suspenso com 2ª',intervals:[0,2,7]},sus4:{label:'Suspenso com 4ª',intervals:[0,5,7]},'7sus4':{label:'7ª com 4ª suspensa',intervals:[0,5,7,10]},add9:{label:'Maior com 9ª adicionada',intervals:[0,2,4,7]},madd9:{label:'Menor com 9ª adicionada',intervals:[0,2,3,7]},mMaj7:{label:'Menor com 7ª maior',intervals:[0,3,7,11]},'7b5':{label:'Dominante com 5ª diminuta',intervals:[0,4,6,10]},'7#5':{label:'Dominante com 5ª aumentada',intervals:[0,4,8,10]},
 '9':{label:'Dominante com 9ª · 7(9)',intervals:[0,4,7,10,14]},maj9:{label:'Maior com 7ª maior e 9ª · 7M(9)',intervals:[0,4,7,11,14]},m9:{label:'Menor com 9ª · m7(9)',intervals:[0,3,7,10,14]},'11':{label:'Dominante com 11ª',intervals:[0,4,7,10,14,17]},maj11:{label:'Maior com 11ª',intervals:[0,4,7,11,14,17]},m11:{label:'Menor com 11ª',intervals:[0,3,7,10,14,17]},'7(13)':{label:'Dominante com 7ª e 13ª',intervals:[0,4,7,10,21]},'13':{label:'Dominante com 13ª',intervals:[0,4,7,10,14,17,21]},maj13:{label:'Maior com 13ª',intervals:[0,4,7,11,14,17,21]},m13:{label:'Menor com 13ª',intervals:[0,3,7,10,14,17,21]},'6/9':{label:'Maior com 6ª e 9ª',intervals:[0,4,7,9,14]},'m6/9':{label:'Menor com 6ª e 9ª',intervals:[0,3,7,9,14]},'7(b9)':{label:'Dominante com 9ª menor',intervals:[0,4,7,10,13]},'7(#9)':{label:'Dominante com 9ª aumentada',intervals:[0,4,7,10,15]},'7(#11)':{label:'Dominante com 11ª aumentada',intervals:[0,4,7,10,18]},'7(b13)':{label:'Dominante com 13ª menor',intervals:[0,4,7,10,20]},'9(#11)':{label:'Nona com 11ª aumentada',intervals:[0,4,7,10,14,18]},'7(b9,b13)':{label:'Dominante com 9ª e 13ª menores',intervals:[0,4,7,10,13,20]},'m7(11)':{label:'Menor com 7ª e 11ª',intervals:[0,3,7,10,17]},'maj7(#11)':{label:'Maior com 7ª maior e 11ª aumentada',intervals:[0,4,7,11,18]},'7(b9,#11)':{label:'Dominante com 9ª menor e 11ª aumentada',intervals:[0,4,7,10,13,18]},'7(#9,b13)':{label:'Dominante com 9ª aumentada e 13ª menor',intervals:[0,4,7,10,15,20]},'13(b9)':{label:'Dominante com 13ª e 9ª menor',intervals:[0,4,7,10,13,17,21]},'5':{label:'Fundamental e quinta',intervals:[0,7]}
};
export function pc(note){const m=/^([A-G])(bb|##|x|b|#)?$/.exec(note);if(!m)return null;return (({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+({bb:-2,b:-1,'#':1,'##':2,x:2}[m[2]]||0))%12+12)%12;}
function normalize(value){return String(value).trim().normalize('NFC').replace(/♯/g,'#').replace(/♭/g,'b').replace(/△|∆/g,'Δ').replace(/\s+/g,'').replace(/(^|\/)(D[oó]|R[eé]|Mi|F[aá]|Sol|L[aá]|Si)(?=[#b(0-9mM+°øΔ\/]|$)/gi,(_,prefix,n)=>prefix+({'do':'C','dó':'C','re':'D','ré':'D',mi:'E',fa:'F','fá':'F',sol:'G',la:'A','lá':'A',si:'B'}[n.toLowerCase()])).replace(/^[a-g]/,n=>n.toUpperCase()).replace(/\/([a-g])(?=[#b]|$)/g,(_,n)=>'/'+n.toUpperCase());}
const baseDegrees={1:0,2:2,3:4,4:5,5:7,6:9,7:10,9:14,11:17,13:21};
function spell(root,degree,interval){const letters='CDEFGAB',letter=letters[(letters.indexOf(root[0])+degree-1)%7],target=(pc(root)+interval)%12,natural=pc(letter);let delta=(target-natural+12)%12;if(delta>6)delta-=12;return Math.abs(delta)<=2?letter+(delta>0?'#'.repeat(delta):'b'.repeat(-delta)):names[target];}
export function parseChord(input){
 const symbol=normalize(input);if(symbol.length>80)return null;
 const m=/^([A-G](?:bb|##|x|b|#)?)(.*?)(?:\/([A-G](?:bb|##|x|b|#)?))?$/.exec(symbol);if(!m)return null;const rootName=m[1];let tail=m[2];if(/^7\(4\)$/.test(tail))tail='7sus4';if(tail==='4')tail='sus4';
 if((tail.match(/\(/g)||[]).length!==(tail.match(/\)/g)||[]).length)return null;
 tail=tail.replace(/\(([^()]*)\)/g,'$1');if(/[()]/.test(tail))return null;
 tail=tail.replace(/^(?:7M|7\+|M7|Δ7|Δ)/,'maj7').replace(/^m(?:7M|M7|Maj7|maj7)/,'mmaj7').replace(/^min/,'m').replace(/^-/,'m').replace(/^ø7?/,'m7b5').replace(/^°7/,'dim7').replace(/^°/,'dim').replace(/^\+/,'aug');
 const prefix=/^(mmaj|maj|dim|aug|m)?(13|11|9|7|6|5)?/.exec(tail);let family=prefix[1]||'',extension=Number(prefix[2]||0),rest=tail.slice(prefix[0].length);
 const tones=[{degree:1,interval:0},{degree:3,interval:family.startsWith('m')&&family!=='maj'?3:4},{degree:5,interval:family==='dim'?6:family==='aug'?8:7}];
 if(family==='dim')tones[1].interval=3;
 const remove=degree=>{for(let i=tones.length-1;i>=0;i--)if(tones[i].degree===degree)tones.splice(i,1);};
 const add=(degree,interval)=>tones.push({degree,interval});
 if(extension===5)remove(3);
 if(extension===6)add(6,9);
 if(extension>=7){add(7,family==='maj'||family==='mmaj'?11:family==='dim'?9:10);if(extension>=9)add(9,14);if(extension>=11)add(11,17);if(extension>=13)add(13,21);}
 // 6/9 é extensão; /E é indicação de baixo.
 if(rest.startsWith('/9')&&extension===6){add(9,14);rest=rest.slice(2);}
 if(extension>=6)rest=rest.replace(/\/(?=\d)/g,'');
 const sus=/^sus([24])?/.exec(rest);if(sus){remove(3);const degree=Number(sus[1]||4);add(degree,baseDegrees[degree]);rest=rest.slice(sus[0].length);}
 const altered=new Set();
 while(rest){rest=rest.replace(/^[,;]/,'');if(!rest)break;const token=/^(add|no|omit)?([#b]?)(13|11|9|7|6|5|4|3|2)/.exec(rest);if(!token)return null;const action=token[1]||'',sign=token[2],degree=Number(token[3]);rest=rest.slice(token[0].length);
 if(action==='no'||action==='omit'){if(sign)return null;remove(degree);continue;}
 if(!altered.has(degree)){remove(degree);altered.add(degree);}const interval=baseDegrees[degree]+(sign==='#'?1:sign==='b'?-1:0);if(!tones.some(t=>t.degree===degree&&t.interval===interval))add(degree,interval);
 }
 tones.sort((a,b)=>a.degree-b.degree||a.interval-b.interval);if(tones.length<2)return null;
 const pitchSet=[...new Set(tones.map(t=>t.interval%12))].sort((a,b)=>a-b);
 const quality=Object.keys(qualities).find(k=>JSON.stringify([...new Set(qualities[k].intervals.map(i=>i%12))].sort((a,b)=>a-b))===JSON.stringify(pitchSet))??m[2];
 const bass=m[3]?pc(m[3]):null;
 return {symbol,rootName,root:pc(rootName),quality,bass,bassName:m[3]||null,tones:tones.map(t=>({...t,label:(()=>{const delta=t.interval-(t.degree===7?11:baseDegrees[t.degree]);return (delta<0?'b'.repeat(-delta):'#'.repeat(delta))+t.degree;})(),note:spell(rootName,t.degree,t.interval),pc:(pc(rootName)+t.interval)%12})),intervals:tones.map(t=>t.interval),canonical:rootName+quality+(m[3]?'/'+m[3]:''),aliases:quality==='9'?[rootName+'9',rootName+'7(9)']:quality==='maj9'?[rootName+'maj9',rootName+'7M(9)']:[]};
}
export function transposeChord(symbol,steps){const normalized=normalize(symbol),m=/^([A-G](?:bb|##|x|b|#)?)(.*?)(?:\/([A-G](?:bb|##|x|b|#)?))?$/.exec(normalized);if(!m)return symbol;const shift=s=>names[((pc(s)+steps)%12+12)%12];return shift(m[1])+m[2]+(m[3]?'/'+shift(m[3]):'');}
