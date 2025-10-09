import http from 'k6/http';
import { sleep, check } from 'k6';
import {pegarBaseURL} from '../utils/variaveis.js';

export const options = {
    iterations: 1,
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    },
};
export default function () {

    const url = pegarBaseURL() +'/users';
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    };

    const res = http.get(url, params);

    check(res, {
        '200 - Exibir relação de usuários': (r) => r.status === 200,
    });
    console.log(`GET ${url} -> status: ${res.status}`);
    console.log(`GET ${url} -> status: ${res.body}`);

    // Tenta parsear a resposta como JSON e validar que é uma lista
    let users = null;
    try {
        // k6 Response tem o método .json() que já faz o parse
        users = res.json();
    } catch (e) {
        // fallback para JSON.parse caso o método não esteja disponível
        try {
            users = JSON.parse(res.body);
        } catch (err) {
            console.log('Não foi possível parsear o body como JSON');
        }
    }

    // Checa se veio um array
    const isArray = Array.isArray(users);
    check(isArray, { 'retorna array de usuários': (v) => v === true });
    console.log(`usuarios retornados: ${isArray ? users.length : 'não é um array'}`);

    // Se houver ao menos um usuário, loga o primeiro com seus campos principais
    if (isArray && users.length > 0) {
        const first = users[0];
        check(first, {
            'primeiro tem username': (u) => u && u.username !== undefined,
            'primeiro tem favorecidos': (u) => u && u.favorecidos !== undefined,
        });
        console.log(`primeiro usuario: ${JSON.stringify(first)}`);
    }

    sleep(1);
}
