// UNIFED-PROBATUM | server-auth/authController.js
// Motor de dispersão (SHA-256) + comparação em tempo constante.
// Toda a lógica de validação reside aqui — no servidor. O cliente nunca
// recebe nem calcula o hash; apenas submete username/password em texto
// limpo sobre um canal TLS (HTTPS), conforme especificado.

'use strict';

const crypto = require('crypto');
const config = require('./config');

/**
 * Calcula o SHA-256 (hex, lowercase) de uma string UTF-8.
 * @param {string} plaintext
 * @returns {string} 64 caracteres hexadecimais
 */
function sha256Hex(plaintext) {
    return crypto.createHash('sha256').update(plaintext, 'utf8').digest('hex');
}

/**
 * Comparação em tempo constante entre dois hashes hexadecimais.
 * Usa crypto.timingSafeEqual sobre Buffers — NUNCA ===, que permite a um
 * atacante inferir, por análise estatística de latência, em que posição
 * a comparação falhou primeiro (timing side-channel attack).
 *
 * timingSafeEqual exige Buffers do MESMO comprimento (lança RangeError
 * caso contrário) — por isso validamos o comprimento ANTES de a invocar.
 * Esta verificação de comprimento não constitui, por si, um side-channel
 * relevante: o comprimento esperado (64 chars/32 bytes) é público e
 * constante; o que tem de ser protegido é o CONTEÚDO do hash armazenado.
 *
 * @param {string} hashA - hash hex de 64 chars
 * @param {string} hashB - hash hex de 64 chars
 * @returns {boolean}
 */
function timingSafeHexEqual(hashA, hashB) {
    const bufA = Buffer.from(hashA, 'hex');
    const bufB = Buffer.from(hashB, 'hex');

    if (bufA.length !== bufB.length || bufA.length === 0) {
        return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Valida um par username/password submetido contra as credenciais
 * esperadas (config.usernameExpected / config.passwordHashExpected).
 *
 * @param {string} submittedUsername
 * @param {string} submittedPassword - texto limpo, recebido via HTTPS
 * @returns {boolean}
 */
function validateCredentials(submittedUsername, submittedPassword) {
    if (typeof submittedUsername !== 'string' || typeof submittedPassword !== 'string') {
        return false;
    }
    if (submittedUsername.length === 0 || submittedPassword.length === 0) {
        return false;
    }

    // Username: não é segredo criptográfico no mesmo sentido que a
    // password, mas usamos timingSafeEqual também aqui por defesa em
    // profundidade (evita até um side-channel residual sobre o prefixo
    // do username correcto).
    const usernameMatches = timingSafeHexEqual(
        sha256Hex(submittedUsername),
        sha256Hex(config.usernameExpected)
    );

    const submittedHash = sha256Hex(submittedPassword);
    const passwordMatches = timingSafeHexEqual(submittedHash, config.passwordHashExpected);

    // IMPORTANTE: usar '&' lógico simples (não '&&' com short-circuit) não
    // é necessário aqui porque ambas as comparações já correram acima,
    // de forma incondicional, ANTES desta linha — não há short-circuit
    // que permita a um atacante distinguir "username errado" de
    // "password errada" por tempo de resposta.
    return usernameMatches && passwordMatches;
}

module.exports = { sha256Hex, timingSafeHexEqual, validateCredentials };
