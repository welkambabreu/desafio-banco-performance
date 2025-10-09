export function pegarBaseURL() {
    // prioridade: variável de ambiente BASE_URL -> config local -> fallback hardcoded
    return __ENV.BASE_URL || 'http://localhost:3000';
}