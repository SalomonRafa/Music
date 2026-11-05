// Estimativa experimental de classes de altura; não é transcrição polifônica validada.
export function estimateTriad(db,sampleRate,fftSize){
 const energy=Array(12).fill(0),peaks=[];let max=-Infinity;
 for(let i=1;i<db.length-1;i++){const hz=i*sampleRate/fftSize;if(hz<150||hz>1300)continue;if(db[i]>max)max=db[i];}
 if(max< -55)return null;
 for(let i=2;i<db.length-2;i++){let hz=i*sampleRate/fftSize;if(hz<150||hz>1300||db[i]<max-22||db[i]<db[i-1]||db[i]<db[i+1])continue;
 const denom=db[i-1]-2*db[i]+db[i+1];const shift=denom?Math.max(-.5,Math.min(.5,.5*(db[i-1]-db[i+1])/denom)):0;hz=(i+shift)*sampleRate/fftSize;const midi=69+12*Math.log2(hz/440),nearest=Math.round(midi);if(Math.abs(midi-nearest)>.35)continue;peaks.push(hz);energy[((nearest%12)+12)%12]+=10**((db[i]-max)/20)/Math.sqrt(hz/150);
 }
 const ranked=energy.map((value,pc)=>({value,pc})).sort((a,b)=>b.value-a.value);if(ranked[2].value<ranked[0].value*.18||ranked[3].value>ranked[2].value*.65)return null;
 const set=new Set(ranked.slice(0,3).map(x=>x.pc));const candidates=[];for(let root=0;root<12;root++)for(const [quality,third] of [['',4],['m',3]])if([root,(root+third)%12,(root+7)%12].every(n=>set.has(n)))candidates.push({root,quality});
 if(candidates.length!==1)return null;return {...candidates[0],label:['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][candidates[0].root]+candidates[0].quality};
}
