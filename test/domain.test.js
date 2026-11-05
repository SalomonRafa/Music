import test from 'node:test';
import assert from 'node:assert/strict';
import {makePlan,loadState} from '../src/domain.js';
test('roteiros respeitam o orçamento em todos os tempos disponíveis',()=>{for(const minutes of [5,10,15,20,25,30])for(const goal of ['acompanhar','ritmo','fundamentos']){const p=makePlan(minutes,goal);assert.equal(p.reduce((s,x)=>s+x.minutes,0),minutes);assert.ok(p.every(x=>x.minutes>0));assert.ok(p.every(x=>x.description&&x.success));}});
test('sessão curta prioriza pulso e clareza',()=>{assert.deepEqual(makePlan(5).map(x=>x.id),['pulse','clarity']);});
test('armazenamento ausente ou inválido mantém um perfil utilizável',()=>{for(const value of [null,'{','{}','{"profile":null,"sessions":[]}']){const s=loadState({getItem:()=>value});assert.equal(s.profile.minutes,15);assert.deepEqual(s.sessions,[]);}});
test('histórico e perfil são recuperados sem perder registros',()=>{const s={profile:{name:'Rafael'},sessions:[{minutes:10}]};assert.deepEqual(loadState({getItem:()=>JSON.stringify(s)}),s);});
