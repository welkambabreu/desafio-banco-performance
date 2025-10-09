import http from 'k6/http';
import { sleep, check } from 'k6';
import { obterToken } from '../helpers/autenticacao.js';
import { pegarBaseURL } from '../utils/variaveis.js';
const postTransfer = JSON.parse(open('../fixtures/transfer.json'));

export const options = {
    iterations: 1
};

export default function () {

    const token = obterToken();

    console.log('Token obtido: ' + token);

    const url = pegarBaseURL() + '/transfers';
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    };

    const res = http.get(url, params);

    check(res, {
        '200 - Exibição da lista de transferências': (r) => r.status === 200,
    });
    console.log(`GET ${url} -> status: ${res.status}`);
    console.log(`GET ${url} -> status: ${res.body}`);

    // Cenário 2: sem token -> espera 401
    const paramsNoAuth = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    const resNoAuth = http.get(url, paramsNoAuth);
    check(resNoAuth, {
        '401 - Token não fornecido ou inválido': (r) => r.status === 401,
    });
    console.log(`GET ${url} (no auth) -> status: ${resNoAuth.status}`);
}