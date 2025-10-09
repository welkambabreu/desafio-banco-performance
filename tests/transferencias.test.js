import http from 'k6/http';
import { sleep, check } from 'k6';
import { obterToken } from '../helpers/autenticacao.js';
import {pegarBaseURL} from '../utils/variaveis.js';
const postTransfer = JSON.parse(open('../fixtures/transfer.json'));

export const options = {
  iterations: 1
};

export default function () {
  const token = obterToken();

  console.log('Token obtido: ' + token);
  
  const url = pegarBaseURL() + '/transfers';

  // Payloads do fixture
  const validPayload = JSON.stringify(postTransfer.valid);
  const invalidPayload = JSON.stringify(postTransfer.invalid);

  const paramsAuth = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  const paramsNoAuth = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 1) Cenário de sucesso - Transferência realizada (201)
  const resSuccess = http.post(url, validPayload, paramsAuth);
  check(resSuccess, { 'transferencia criada (201)': (r) => r.status === 201 });
  console.log(`post-success -> status: ${resSuccess.status}, body: ${resSuccess.body}`);

  // 2) Cenário de validação/regra - Payload inválido (400)
  const resInvalid = http.post(url, invalidPayload, paramsAuth);
  check(resInvalid, { 'erro de validacao (400)': (r) => r.status === 400 });
  console.log(`post-invalid -> status: ${resInvalid.status}, body: ${resInvalid.body}`);

  // 3) Cenário sem token - Não autorizado (401)
  const resNoAuth = http.post(url, validPayload, paramsNoAuth);
  check(resNoAuth, { 'nao autorizado (401)': (r) => r.status === 401 });
  console.log(`post-noauth -> status: ${resNoAuth.status}, body: ${resNoAuth.body}`);

  sleep(1);
}