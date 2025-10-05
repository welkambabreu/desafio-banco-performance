import http from 'k6/http';
import { sleep, check } from 'k6';
// Carrega os payloads de fixtures
const postLogin = JSON.parse(open('./fixtures/postLogin.json'));

export const options = {
    iterations: 1,
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    },
};

export default function () {

    const url = 'http://localhost:3000/users/login';
   
     // Usa o payload válido do arquivo JSON
     const payload = JSON.stringify(postLogin.valid);

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 1) Primeiro POST: usuário único — esperamos criação (200)
    const loginRes = http.post(url, payload, params);
    check(loginRes, {
        'login com sucesso (200)': (r) => r.status === 200
    });
    console.log(`login com sucesso -> status: ${loginRes.status}, body: ${loginRes.body}`);

    // 2) Segundo POST: tenta logar com credenciais inválidas (senha errada)
    // Usa o payload inválido do arquivo JSON
    const invalidPayload = JSON.stringify(postLogin.invalid);

    const invalidRes = http.post(url, invalidPayload, params);
    // Alguns backends retornam 401 (Unauthorized) ou 400; aceitamos ambos para tornar o teste mais flexível
    check(invalidRes, {
        'usuario invalido (401|400)': (r) => r.status === 401 || r.status === 400,
    });
    console.log(`usuario invalido -> status: ${invalidRes.status}, body: ${invalidRes.body}`);

    sleep(1);
}