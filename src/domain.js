import {STANDARD_TUNING,LEGACY_INCORRECT_TUNING} from './instrument.js?v=0.18.2';
export const exercises=[
 {id:'pulse',title:'Encontre o pulso',label:'Ritmo',minutes:3,bpm:60,description:'Abafe as cordas suavemente com a mão esquerda. Faça uma palhetada para baixo a cada clique, sem apertar os dedos contra a escala.',success:'Complete 4 grupos de 8 cliques sem interromper o pulso. Se perder o clique, recomece o grupo.'},
 {id:'clarity',title:'Uma nota de cada vez',label:'Clareza',minutes:4,bpm:null,description:'Com o instrumento afinado, toque cada corda solta separadamente. Escute se o som fica livre. Depois pressione uma corda na primeira casa, perto do traste, e compare. Use apenas a pressão necessária.',success:'Toque as 4 cordas soltas e uma nota pressionada com som claro, sem dor. Repita 3 vezes.'},
 {id:'change',title:'Trocas com intenção',label:'Acordes',minutes:5,bpm:50,description:'Escolha dois acordes que você já conhece e cuja digitação foi conferida para sua afinação. Toque um acorde no primeiro clique e use os próximos três para preparar a troca. Se ainda não conhece dois acordes, repita o exercício de clareza.',success:'Complete 8 trocas no pulso escolhido. Registre quantas soaram limpas; reduza o andamento se necessário.'},
 {id:'phrase',title:'Seu primeiro trecho',label:'Repertório',minutes:5,bpm:50,description:'Escolha um trecho curto de uma música que você já estuda, com cifra conferida. Pratique apenas dois compassos. Se ainda não tem repertório, alterne os dois acordes conhecidos por 8 pulsos cada.',success:'Execute o mesmo trecho 3 vezes, mantendo o pulso e sem parar. Anote o trecho e o resultado.'}
];
export function makePlan(minutes=15,goal='acompanhar',level='iniciante'){
 const total=Math.max(5,Math.min(30,Number(minutes)||15));
 const ids=total<10?['pulse','clarity']:goal==='ritmo'?['pulse','clarity','phrase']:['pulse','clarity','change','phrase'];
 const list=ids.map(id=>({...exercises.find(e=>e.id===id)}));
 let remaining=total;
 return list.map((e,i)=>{const duration=i===list.length-1?remaining:Math.max(1,Math.round(total*e.minutes/list.reduce((s,x)=>s+x.minutes,0)));remaining-=duration;return {...e,minutes:duration,bpm:e.bpm?level==='intermediario'?e.bpm+10:e.bpm:null};});
}
export function loadState(storage){try {const s=JSON.parse(storage.getItem('mestre-cavaquinho-v1'));if(s&&Array.isArray(s.sessions)&&s.profile&&typeof s.profile==='object'){if(s.profile.tuning===LEGACY_INCORRECT_TUNING)s.profile.tuning=STANDARD_TUNING;return s;}}catch{}return {profile:{name:'Rafael',level:'iniciante',goal:'acompanhar',minutes:15,tuning:STANDARD_TUNING},sessions:[]};}
