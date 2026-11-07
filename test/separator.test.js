import test from 'node:test';
import assert from 'node:assert/strict';
import {separatorEndpoint,separatorPage} from '../src/stem-separator.js';
test('serviço usa HTTPS e permite loopback para desenvolvimento',()=>{
 assert.equal(separatorEndpoint('https://separator.example/base/'),'https://separator.example/base');
 assert.equal(separatorEndpoint('http://127.0.0.1:8000/'),'http://127.0.0.1:8000');
 assert.equal(separatorEndpoint('http://localhost:8000/'),'http://localhost:8000');
});
test('recusa URLs inseguras, parâmetros e credenciais no endereço',()=>{
 for(const value of ['http://remote.example','javascript:alert(1)','file:///tmp/audio','https://u:p@remote.example','https://remote.example?token=secret','https://remote.example#token=secret'])assert.throws(()=>separatorEndpoint(value));
});
test('separação indisponível inicialmente e informa envio somente por ação explícita',()=>{
 const html=separatorPage();
 assert.match(html,/id="separator-start" disabled/);
 assert.match(html,/nenhum arquivo será enviado antes/);
 assert.match(html,/Serviço ainda não conectado/);
 assert.match(html,/type="password"/);
 assert.match(html,/Podem restar voz/);
});
