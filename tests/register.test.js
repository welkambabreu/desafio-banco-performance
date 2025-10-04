import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    iterations: 10,
    thresholds: {
        http_req_failed: ['rate>0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
  },
};

export default function () {

    const url = 'http://localhost:3000/users/register';
    // Gera um username único por iteração/virtual user para o primeiro caso
    const uniqueUsername = `ktesteqa_${__VU}_${__ITER}_${Date.now()}`;

    const payload = JSON.stringify({
        username: uniqueUsername,
        password: '123456',
        favorecidos: ['Kaka do Teste'],
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 1) Primeiro POST: usuário único — esperamos criação (200)
    const createRes = http.post(url, payload, params);
    check(createRes, {
        'criado (201)': (r) => r.status === 201
    });
    console.log(`create -> status: ${createRes.status}, body: ${createRes.body}`);

    // 2) Segundo POST: tenta criar novamente o mesmo usuário — esperamos erro de usuário existente (400)
    const duplicateRes = http.post(url, payload, params);
    check(duplicateRes, {
        'usuario existente (400)': (r) => r.status === 400
    });
    console.log(`duplicate -> status: ${duplicateRes.status}, body: ${duplicateRes.body}`);

    sleep(1);
}