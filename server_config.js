// UNIFED-PROBATUM | server-auth/config.js
// Carrega configuração exclusivamente de variáveis de ambiente (.env via
// dotenv em desenvolvimento; em produção, .env não deve existir em disco —
// as variáveis devem ser injetadas pelo orquestrador/secrets manager
// (ex.: Docker secrets, Kubernetes Secret, AWS Secrets Manager, etc.)
// Este ficheiro NUNCA contém valores literais de credenciais.

'use strict';

require('dotenv').config();

const REQUIRED_VARS = ['USERNAME_EXPECTED', 'PASSWORD_HASH_EXPECTED'];

for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
        // Fail-fast: o servidor não arranca sem credenciais configuradas.
        // Evita o cenário "servidor no ar com auth desligada por omissão".
        console.error(`[CONFIG] Variável de ambiente obrigatória em falta: ${key}`);
        process.exit(1);
    }
}

const PASSWORD_HASH_EXPECTED = process.env.PASSWORD_HASH_EXPECTED.trim().toLowerCase();

if (!/^[a-f0-9]{64}$/.test(PASSWORD_HASH_EXPECTED)) {
    console.error('[CONFIG] PASSWORD_HASH_EXPECTED não é um SHA-256 válido (64 hex chars).');
    process.exit(1);
}

module.exports = Object.freeze({
    usernameExpected: process.env.USERNAME_EXPECTED.trim(),
    passwordHashExpected: PASSWORD_HASH_EXPECTED,
    port: parseInt(process.env.PORT, 10) || 8443,
    nodeEnv: process.env.NODE_ENV || 'development',
    tls: {
        certPath: process.env.TLS_CERT_PATH || './certs/server.crt',
        keyPath: process.env.TLS_KEY_PATH || './certs/server.key',
    },
});
