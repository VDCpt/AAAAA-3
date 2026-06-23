#!/usr/bin/env node
/**
 * UNIFED-PROBATUM | server-auth/generate-hash.js
 *
 * Gera o SHA-256 (hex, lowercase) de uma password introduzida de forma
 * interativa, com o terminal em modo "no echo" (a password não aparece
 * no ecrã enquanto é digitada).
 *
 * DELIBERADAMENTE NÃO aceita a password como argumento de linha de
 * comandos (`process.argv`), porque argumentos CLI ficam visíveis:
 *   - no histórico do shell (~/.bash_history, ~/.zsh_history)
 *   - na saída de `ps aux` / `ps -ef` enquanto o processo corre
 *   - em logs de auditoria de sistema, nalguns ambientes
 *
 * Correr com: node generate-hash.js
 * Copiar o resultado para PASSWORD_HASH_EXPECTED em .env.
 */

const crypto = require('crypto');
const readline = require('readline');

function promptHiddenPassword(query) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // Intercepta a escrita para o terminal e substitui os caracteres
        // da password por nada (não-echo), preservando o prompt.
        const stdin = process.stdin;
        let muted = false;

        rl._writeToOutput = function (stringToWrite) {
            if (muted) return; // não escreve nada enquanto a password é digitada
            rl.output.write(stringToWrite);
        };

        rl.question(query, (answer) => {
            rl.history = rl.history.slice(1); // não guardar no histórico do readline
            rl.close();
            process.stdout.write('\n');
            resolve(answer);
        });

        muted = true;
    });
}

async function main() {
    console.log('================================================================');
    console.log(' UNIFED-PROBATUM | Gerador local de hash de password (SHA-256)');
    console.log('================================================================');
    console.log(' A password NUNCA é mostrada no ecrã, gravada em disco, enviada');
    console.log(' pela rede, ou passada como argumento de linha de comandos.');
    console.log('----------------------------------------------------------------\n');

    const password = await promptHiddenPassword('Password a hashear: ');
    const confirm = await promptHiddenPassword('Confirmar password: ');

    if (password !== confirm) {
        console.error('\n[ERRO] As duas entradas não coincidem. Nada foi calculado.');
        process.exit(1);
    }
    if (!password || password.length < 8) {
        console.error('\n[ERRO] Password vazia ou demasiado curta (mínimo 8 caracteres).');
        process.exit(1);
    }

    const hash = crypto.createHash('sha256').update(password, 'utf8').digest('hex');

    console.log('\n--- RESULTADO ---');
    console.log('PASSWORD_HASH_EXPECTED=' + hash);
    console.log('\nCopiar a linha acima para o ficheiro .env (não para .env.example).');
    console.log('\n[AVISO DE ARQUITECTO DE SEGURANÇA]');
    console.log('SHA-256 simples (sem salt, sem custo computacional) é adequado');
    console.log('para um portão de acesso de demonstração de baixo risco, mas NÃO');
    console.log('é prática recomendada para armazenamento de credenciais em produção:');
    console.log('é trivialmente atacável por força bruta em GPU para passwords no');
    console.log('padrão Nome+Ano+Símbolo. Para um sistema de produção real, usar');
    console.log('bcrypt, scrypt ou Argon2id (custo computacional ajustável + salt');
    console.log('automático), não SHA-256 puro.');
}

main();
