// Modelo geométrico para quatro cordas; não afirma conforto nem substitui revisão por professor.
export function planFingering(frets){
 const pressed=frets.map((f,i)=>({f,i})).filter(x=>x.f>0);if(!pressed.length)return {fingers:[null,null,null,null],contacts:[],barres:[],fingerCount:0};
 const target=pressed.reduce((mask,x)=>mask|(1<<x.i),0),candidates=pressed.map(({f,i})=>({fret:f,from:i,to:i,mask:1<<i,barre:false}));
 for(const fret of new Set(pressed.map(x=>x.f)))for(let from=0;from<4;from++)for(let to=from+1;to<4;to++){
  if(frets.slice(from,to+1).some(f=>f<fret))continue;
  let mask=0;for(let i=from;i<=to;i++)if(frets[i]===fret)mask|=1<<i;
  if(mask.toString(2).replace(/0/g,'').length>=2)candidates.push({fret,from,to,mask,barre:true});
 }
 const memo=new Map();function cover(mask){if(mask===target)return {cost:0,contacts:[]};if(memo.has(mask))return memo.get(mask);let best=null;const bit=1<<pressed.find(x=>!(mask&(1<<x.i))).i;
 for(const c of candidates){if(!(c.mask&bit)||(c.mask&mask))continue;const next=cover(mask|c.mask),cost=100+(c.barre?8-(c.to-c.from):0)+next.cost;if(!best||cost<best.cost)best={cost,contacts:[c,...next.contacts]};}memo.set(mask,best);return best;}
 const contacts=cover(0).contacts.sort((a,b)=>a.fret-b.fret||Number(b.barre)-Number(a.barre)||a.from-b.from);let allocation=null;
 function assign(list,next){if(list.length===contacts.length){let cost=(list[0]-1)*2;for(let i=1;i<list.length;i++)cost+=(list[i]-list[i-1]-(contacts[i].fret-contacts[i-1].fret))**2;if(!allocation||cost<allocation.cost)allocation={cost,list:[...list]};return;}for(let finger=next;finger<=4-(contacts.length-list.length-1);finger++)assign([...list,finger],finger+1);}
 assign([],1);const fingers=[null,null,null,null];contacts.forEach((c,i)=>{c.finger=allocation.list[i];for(let j=0;j<4;j++)if(c.mask&(1<<j))fingers[j]=c.finger;});
 return {fingers,contacts,barres:contacts.filter(c=>c.barre),fingerCount:contacts.length};
}
