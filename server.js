// UNIFED-PROBATUM | server-auth/server.js
// Servidor HTTPS Express com endpoint de autenticação server-side.
// Nenhuma lógica de validação de credenciais existe no cliente.

'use strict';

const fs = require('fs');
const https = require('https');
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { validateCredentials } = require('./authController');

const app = express();

app.disable('x-powered-by'); // não anunciar a stack tecnológica
app.use(express.json({ limit: '1kb' })); // payload de login é minúsculo

// Throttling: limita tentativas de força bruta contra o endpoint de login.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 8,                   // 8 tentativas por janela, por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'Demasiadas tentativas. Tente novamente mais tarde.' },
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
    const { username, password } = req.body || {};

    // NUNCA fazer log de `password` (nem de `req.body` na íntegra) —
    // um logger de acesso convencional (morgan, etc.) não deve ser
    // aplicado a esta rota sem redacção explícita do corpo do pedido.
    const isValid = validateCredentials(username, password);

    if (!isValid) {
        // Resposta deliberadamente genérica: não revela se foi o
        // username ou a password que falhou (evita user enumeration).
        return res.status(401).json({ ok: false, error: 'Credenciais inválidas.' });
    }

    // Aqui entraria a emissão de uma sessão/token real (ex.: JWT assinado,
    // ou cookie de sessão httpOnly+secure+sameSite=strict). Fora do âmbito
    // desta especificação — apenas o motor de validação foi pedido.
    return res.status(200).json({ ok: true });
});

// Handler de erro genérico — nunca expor stack traces ao cliente.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error('[SERVER] Erro não tratado:', err.message);
    res.status(500).json({ ok: false, error: 'Erro interno do servidor.' });
});

function startServer() {
    let tlsOptions;
    try {
        tlsOptions = {
            cert: fs.readFileSync(config.tls.certPath),
            key: fs.readFileSync(config.tls.keyPath),
        };
    } catch (e) {
        console.error(
            '[SERVER] Não foi possível ler certificado/chave TLS em ' +
            `${config.tls.certPath} / ${config.tls.keyPath}. ` +
            'Gerar um par de desenvolvimento com:\n' +
            '  openssl req -x509 -newkey rsa:4096 -keyout certs/server.key ' +
            '-out certs/server.crt -days 365 -nodes -subj "/CN=localhost"'
        );
        process.exit(1);
    }

    https.createServer(tlsOptions, app).listen(config.port, '127.0.0.1', () => {
        console.log(`[SERVER] HTTPS a correr em https://127.0.0.1:${config.port} (${config.nodeEnv})`);
    });
}

startServer();
