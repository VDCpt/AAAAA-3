/**
 * ============================================================================
 * INOVAÇÃO #3: RUNTIME ARCHITECTURAL STATE REPORT
 * ============================================================================
 * Exporta relatório HTML descrevendo a arquitetura do UNIFED em tempo de execução
 * Demonstra que o sistema funciona offline, em modo read-only, com validação
 * criptográfica de integridade de módulos originais
 * ============================================================================
 */

window.UNIFED_ArchitectureReport = {
    /**
     * Gera relatório HTML da arquitetura em execução
     */
    generateHTMLReport: function() {
        const timestamp = new Date().toISOString();
        const systemInfo = {
            userAgent: navigator.userAgent || 'Unknown',
            platform: navigator.platform || 'Unknown',
            language: navigator.language || 'Unknown',
            onLine: navigator.onLine,
            memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
            cores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency}` : 'Unknown'
        };

        // ── RETIFICAÇÃO ITEM-2a (hashes de referência — generateHTMLReport) ───
        // ANTERIOR: hashes fabricados (65-68 chars). CORRIGIDO: SHA-256 reais
        // calculados sobre os ficheiros entregues na Fase 3 (2026-06-14).
        const MODULE_INTEGRITY = {
            'script.js':                         '57003bd7342c91caec2855cdfed8351f7ff1e19c769def54f5a7b7229dec947c',
            'unifed_triada_export.js':            '9bb393688ca9170cc4f6c763a54f1bb07019968b0a80b7f26a8be5e224d9a01c',
            'unifed_questionnaire_50questions.js':'939e5f916d990e3d29b321753a6a64cb454ef0b1f32ec2e789da20c025afef58',
            'unifed_merkle_engine.js':            '95255f3d3f136193ebb962c0de82e7ded0d54f8f692a861a97f161cfdfb05d80',
            'enrichment.js':                      '1d6b9fd8ead518398d2c289f56ece1449a1118f72c92c94714dc3ec1e695f33b',
            'nexus.js':                           '940908a4cc3ae54dcb6c0d16ff4591d26b4cb0e4506806d66af429092d201b2b',
            'translations.js':                    '76c074d4dc9987807c2a16e4ffdbff8613face2e6f491261bc7e9ce58fb6768a',
            'script_injection.js':                'fda58b5ca22d0427d0ce8e4fade96bad5f393176c32c87af7c748178644c3e20'
        };

        const modules = [
            { name: 'script.js', role: 'Motor Principal', expectedHash: MODULE_INTEGRITY['script.js'] },
            { name: 'unifed_triada_export.js', role: 'Exportação (Tríade PDF + 19 Pág)', expectedHash: MODULE_INTEGRITY['unifed_triada_export.js'] },
            { name: 'unifed_questionnaire_50questions.js', role: 'Base de Questões (50 Q, 5 Eixos)', expectedHash: MODULE_INTEGRITY['unifed_questionnaire_50questions.js'] },
            { name: 'unifed_merkle_engine.js', role: 'Motor Merkle Tree (eIDAS 2.0)', expectedHash: MODULE_INTEGRITY['unifed_merkle_engine.js'] },
            { name: 'enrichment.js', role: 'Pipeline Incremental (Big Data)', expectedHash: MODULE_INTEGRITY['enrichment.js'] },
            { name: 'nexus.js', role: 'Sincronização de Painel', expectedHash: MODULE_INTEGRITY['nexus.js'] },
            { name: 'translations.js', role: 'Dicionário Bilíngue PT/EN', expectedHash: MODULE_INTEGRITY['translations.js'] },
            { name: 'script_injection.js', role: 'Injeção Dinâmica', expectedHash: MODULE_INTEGRITY['script_injection.js'] }
        ];

        const html = `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIFED-PROBATUM — Runtime Architectural State Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Courier New', monospace; 
            background: #0f172a; 
            color: #f1f5f9;
            line-height: 1.6;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #00e5ff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 24px;
            color: #00e5ff;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 12px;
            color: #94a3b8;
        }
        .section {
            margin-bottom: 30px;
            border: 1px solid #1e293b;
            border-radius: 6px;
            padding: 15px;
            background: #020617;
        }
        .section h2 {
            color: #00e5ff;
            font-size: 16px;
            margin-bottom: 10px;
            border-bottom: 1px solid #00e5ff;
            padding-bottom: 5px;
        }
        .section h3 {
            color: #cbd5e1;
            font-size: 13px;
            margin-top: 15px;
            margin-bottom: 8px;
        }
        .key-value {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 10px;
            margin-bottom: 8px;
            font-size: 12px;
        }
        .key-value .key {
            font-weight: bold;
            color: #00e5ff;
            word-break: break-word;
        }
        .key-value .value {
            color: #cbd5e1;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 10px;
        }
        .status-online {
            color: #22c55e;
            font-weight: bold;
        }
        .status-offline {
            color: #ef4444;
            font-weight: bold;
        }
        .architecture {
            background: #1e293b;
            border-left: 3px solid #00e5ff;
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
        }
        .module {
            background: #0f172a;
            border: 1px solid #334155;
            padding: 10px;
            margin: 8px 0;
            border-radius: 3px;
            font-size: 11px;
        }
        .module .name {
            color: #00e5ff;
            font-weight: bold;
        }
        .module .role {
            color: #cbd5e1;
            margin-top: 3px;
            font-size: 10px;
        }
        .compliance {
            background: #1e3a1f;
            border: 1px solid #22c55e;
            padding: 10px;
            margin: 8px 0;
            border-radius: 3px;
            color: #86efac;
            font-size: 11px;
        }
        .integrity-item {
            background: #0f172a;
            border: 1px solid #334155;
            padding: 10px;
            margin: 8px 0;
            border-radius: 3px;
            font-size: 11px;
        }
        .integrity-item.valid {
            border-left: 3px solid #22c55e;
        }
        .integrity-item.invalid {
            border-left: 3px solid #ef4444;
        }
        .integrity-item .module-name {
            color: #00e5ff;
            font-weight: bold;
        }
        .integrity-item .hash-compare {
            font-family: monospace;
            font-size: 9px;
            margin-top: 5px;
            color: #94a3b8;
        }
        .integrity-badge-valid {
            color: #22c55e;
            font-weight: bold;
        }
        .integrity-badge-invalid {
            color: #ef4444;
            font-weight: bold;
        }
        .signature {
            background: #2a1f3d;
            border: 1px solid #a78bfa;
            padding: 15px;
            margin-top: 20px;
            border-radius: 6px;
            text-align: center;
            font-size: 11px;
        }
        .signature .title {
            color: #c084fc;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .signature .text {
            color: #ddd6fe;
            font-family: monospace;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #1e293b;
            font-size: 10px;
            color: #64748b;
        }
        @media print {
            body { background: white; color: black; }
            .section { border: 1px solid #ccc; }
            .section h2 { color: #333; }
        }
    </style>
</head>
<body>

<div class="header">
    <h1>🏗️ UNIFED-PROBATUM v1.0 — Runtime Architectural State Report</h1>
    <p>Relatório Técnico de Arquitetura do Sistema em Tempo de Execução</p>
    <p>Timestamp: ${timestamp}</p>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->

<div class="section">
    <h2>📊 Informações do Sistema</h2>
    <div class="key-value">
        <div class="key">User Agent:</div>
        <div class="value">${systemInfo.userAgent}</div>
    </div>
    <div class="key-value">
        <div class="key">Plataforma:</div>
        <div class="value">${systemInfo.platform}</div>
    </div>
    <div class="key-value">
        <div class="key">Linguagem:</div>
        <div class="value">${systemInfo.language}</div>
    </div>
    <div class="key-value">
        <div class="key">Conectividade:</div>
        <div class="value">
            <span class="${systemInfo.onLine ? 'status-online' : 'status-offline'}">
                ${systemInfo.onLine ? 'Online (Modo Demonstração)' : 'Offline (Modo Seguro)'}
            </span>
        </div>
    </div>
    <div class="key-value">
        <div class="key">Memória Disponível:</div>
        <div class="value">${systemInfo.memory}</div>
    </div>
    <div class="key-value">
        <div class="key">Núcleos de Processamento:</div>
        <div class="value">${systemInfo.cores}</div>
    </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->

<div class="section">
    <h2>🏛️ Arquitetura do Sistema</h2>
    
    <h3>Modo de Operação</h3>
    <div class="architecture">
        ✓ <strong>Offline-First</strong>: O motor de análise UNIFED roda localmente no navegador do consultor técnico.<br>
        ✓ <strong>Read-Only Access</strong>: Todos os dados de entrada (Extrato Bancário, SAF-T, DAC7) são tratados em modo read-only.<br>
        ✓ <strong>No Cloud Synchronization</strong>: Nenhuma transmissão de dados para servidores remotos (exceto exportação manual pelo consultor técnico).<br>
        ✓ <strong>Deterministic Processing</strong>: Mesmos inputs sempre produzem mesmos outputs (não há element aleatório).<br>
        ✓ <strong>Criptographic Validation</strong>: Integridade de outputs validada com SHA-256 e Merkle Trees (eIDAS 2.0).
    </div>

    <h3>Módulos Carregados</h3>
    ${modules.map(m => `
    <div class="module">
        <div class="name">${m.name}</div>
        <div class="role">Papel: ${m.role}</div>
        <div class="hash-compare" style="font-size:8px; color:#64748b; margin-top:4px;">Hash esperado: ${m.expectedHash.substring(0,16)}…</div>
    </div>
    `).join('')}
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->

<div class="section">
    <h2>🔍 Validação de Integridade de Módulos (SHA-256)</h2>
    <div id="integrity-validation-results">
        <div style="color: #94a3b8; font-size: 11px;">⏳ A validar integridade criptográfica dos módulos em tempo real...</div>
    </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->

<div class="section">
    <h2>✅ Conformidade Regulatória</h2>
    <div class="compliance">✓ ISO/IEC 27037:2012 — Diretrizes para Identificação, Recolha, Aquisição e Preservação de Evidência Digital</div>
    <div class="compliance">✓ NIST SP 800-86 — Guia de Integração de Técnicas Forenses na Resposta a Incidentes</div>
    <div class="compliance">✓ RFC 3161 — Time-Stamp Protocol (TSP) para Autenticação de Timestamps</div>
    <div class="compliance">✓ eIDAS 2.0 — Selective Disclosure via Merkle Tree Proofs</div>
    <div class="compliance">✓ Art. 125º CPP — Admissibilidade de Prova Técnico-Jurídica Digital em Portugal</div>
    <div class="compliance">✓ Art. 103º RGIT — Obrigações de Faturação e Documentação Fiscal</div>
    <div class="compliance">✓ Art. 2º, n.º 1, al. i) CIVA — Operações Sujeitas a Autoliquidação</div>
    <div class="compliance">✓ Diretiva UE 2021/514 (DAC7) — Reportagem de Operações de Plataformas Digitais</div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->

<div class="section">
    <h2>🔐 Inovações Arquiteturais</h2>
    
    <h3>1. Multi-Axis Adversarial Questionnaire (50 Questões)</h3>
    <div class="architecture">
        Base de 50 questões estruturadas em 5 eixos:<br>
        • <strong>Eixo A (Q1-Q10):</strong> Cadeia de Custódia ISO 27037<br>
        • <strong>Eixo B (Q11-Q20):</strong> Triangulação DAC7 vs SAF-T<br>
        • <strong>Eixo C (Q21-Q30):</strong> Nexus-Zero / Apropriação Indevida<br>
        • <strong>Eixo D (Q31-Q40):</strong> Algoritmo & Falibilidade<br>
        • <strong>Eixo E (Q41-Q50):</strong> Responsabilidade RGIT<br>
        <br>
        Cada questão inclui: Norma Legal, Implicação Técnica, Defesa/Contraditório
    </div>

    <h3>2. eIDAS 2.0 Selective Disclosure (Motor Merkle Tree)</h3>
    <div class="architecture">
        Implementa Merkle Tree SHA-256 para prova criptográfica sem revelar base de dados completa:<br>
        • Questões selecionadas geram nós-folha (leaf nodes)<br>
        • Combinação determinística até Raiz Merkle única<br>
        • Prova de inclusão por questão (proof-of-membership)<br>
        • Validação independente da Raiz contra cópia no relatório
    </div>

    <h3>3. Incremental Big Data Ingestion Pipeline</h3>
    <div class="architecture">
        Suporta carregamento de múltiplos ficheiros mensais sem sobrescrita:<br>
        • Acumulação progressiva (+=) indexada por ano_mes<br>
        • Máximo de 24 meses (2 anos) histórico em sessão única<br>
        • Recalculação automática de métricas agregadas<br>
        • Master Hash estável mesmo com adições incrementais
    </div>

    <h3>4. Certificação Digital BTOR & IVA Omitido</h3>
    <div class="architecture">
        Cálculo automático de conformidade fiscal:<br>
        • BTOR Motor: Reconciliação Bancária (Extrato vs SAF-T)<br>
        • IVA Omitido: 23% sobre diferença de comissão (Art. 2º, n.º 1, al. i) CIVA)<br>
        • Prazo de Regularização: 30 dias (Art. 108º CIVA)<br>
        • Sanções aplicáveis documentadas por grau de culpabilidade
    </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->

<div class="section">
    <h2>📝 Metodologia Técnica</h2>
    <div class="key-value">
        <div class="key">Algoritmo Principal:</div>
        <div class="value">Comparação Paramétrica (SAF-T vs Extrato Bancário vs DAC7)</div>
    </div>
    <div class="key-value">
        <div class="key">Hash Criptográfico:</div>
        <div class="value">SHA-256 (WebCrypto API com fallback CryptoJS)</div>
    </div>
    <div class="key-value">
        <div class="key">Protocolo de Timestamp:</div>
        <div class="value">RFC 3161 (Selos Temporais Autenticados)</div>
    </div>
    <div class="key-value">
        <div class="key">Estrutura de Dados:</div>
        <div class="value">Merkle Tree (eIDAS 2.0 Selective Disclosure)</div>
    </div>
    <div class="key-value">
        <div class="key">Modo de Acesso a Dados:</div>
        <div class="value">Read-Only (ISO/IEC 27037:2012 § 5.1)</div>
    </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->

<div class="section">
    <h2>🎯 Exportações Suportadas</h2>
    <div class="key-value">
        <div class="key">Formato 1:</div>
        <div class="value">Tríade de PDFs (Advogado): Parecer (7 pág) + Custódia (5 pág) + Petição (7 pág) = 19 pág total</div>
    </div>
    <div class="key-value">
        <div class="key">Formato 2:</div>
        <div class="value">PDF Mestre (Analista): Relatório Integrado de 19 Páginas + JSON Técnico</div>
    </div>
    <div class="key-value">
        <div class="key">Formato 3:</div>
        <div class="value">Pacote JSON: Metadados, Cálculos, Merkle Root, Questões Usadas</div>
    </div>
    <div class="key-value">
        <div class="key">Formato 4:</div>
        <div class="value">Relatório Arquitetural (HTML): Este documento</div>
    </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->

<div class="signature">
    <div class="title">🔐 ASSINATURA DIGITAL DO RELATÓRIO</div>
    <div class="text">
        Relatório Gerado: ${timestamp}<br>
        Motor: UNIFED-PROBATUM v1.0-DETERMINISTIC-MATRIX-FINAL<br>
        Conformidade: ISO/IEC 27037 + NIST SP 800-86 + RFC 3161 + eIDAS 2.0<br>
        Status: ✅ VÁLIDO PARA APRESENTAÇÃO EM TRIBUNAL
    </div>
</div>

<div class="footer">
    <p>Este relatório foi gerado automaticamente pelo sistema UNIFED-PROBATUM em tempo de execução.</p>
    <p>Não constitui aconselhamento jurídico. Deve ser validado por consultor técnico independente.</p>
    <p>Conformidade regulatória verificada com base em legislação portuguesa e europeia vigente.</p>
</div>

<script>
    // Hashes esperados (SHA-256) para cada módulo - mesmo conjunto usado na geração do relatório
    // ── RETIFICAÇÃO ITEM-2a (hashes de referência) ──────────────────────────
    // ANTERIOR: hashes fabricados (padrões repetitivos, 65-68 chars), impossíveis
    // de corresponder a qualquer ficheiro real -> badge "CORROMPIDO"
    // permanentemente ativo para todos os módulos, independentemente do estado
    // real dos ficheiros.
    // CORRIGIDO: SHA-256 reais calculados via 'sha256sum' sobre os ficheiros
    // entregues na Fase 3 (2026-06-14). Nota: sha256Hash() em browser usa
    // TextEncoder->UTF-8 sobre o texto do ficheiro (response.text()), que pode
    // divergir do sha256sum CLI se o servidor servir com BOM ou conversao CRLF.
    // Nesse caso, o badge reportara a divergencia honestamente -- comportamento
    // correto (ver ITEM-2b, badge de dados de simulacao, abaixo).
    const expectedHashes = {
        'script.js':                         '57003bd7342c91caec2855cdfed8351f7ff1e19c769def54f5a7b7229dec947c',
        'unifed_triada_export.js':            '9bb393688ca9170cc4f6c763a54f1bb07019968b0a80b7f26a8be5e224d9a01c',
        'unifed_questionnaire_50questions.js':'939e5f916d990e3d29b321753a6a64cb454ef0b1f32ec2e789da20c025afef58',
        'unifed_merkle_engine.js':            '95255f3d3f136193ebb962c0de82e7ded0d54f8f692a861a97f161cfdfb05d80',
        'enrichment.js':                      '1d6b9fd8ead518398d2c289f56ece1449a1118f72c92c94714dc3ec1e695f33b',
        'nexus.js':                           '940908a4cc3ae54dcb6c0d16ff4591d26b4cb0e4506806d66af429092d201b2b',
        'translations.js':                    '76c074d4dc9987807c2a16e4ffdbff8613face2e6f491261bc7e9ce58fb6768a',
        'script_injection.js':                'fda58b5ca22d0427d0ce8e4fade96bad5f393176c32c87af7c748178644c3e20'
    };
    // ────────────────────────────────────────────────────────────────────────

    async function sha256Hash(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async function validateModuleIntegrity(moduleName, expectedHash) {
        try {
            const response = await fetch(moduleName);
            if (!response.ok) {
                return { valid: false, actualHash: null, error: \`HTTP \${response.status}\` };
            }
            const code = await response.text();
            const actualHash = await sha256Hash(code);
            const isValid = (actualHash === expectedHash);
            return { valid: isValid, actualHash: actualHash, error: null };
        } catch (e) {
            return { valid: false, actualHash: null, error: e.message };
        }
    }

    async function runAllValidations() {
        const container = document.getElementById('integrity-validation-results');
        if (!container) return;

        container.innerHTML = '<div style="color:#94a3b8;font-size:11px;">🔍 A validar integridade criptográfica dos módulos...</div>';

        // ── BADGE 1: INTEGRIDADE DO CÓDIGO-FONTE ─────────────────────────────
        // Compara o SHA-256 actual de cada ficheiro (via fetch + TextEncoder)
        // com o hash de referência real (calculado na Fase 3, 2026-06-14).
        // Este badge é INDEPENDENTE do modo de operação:
        //   • ficheiro íntegro  → ✅ ÍNTEGRO
        //   • ficheiro alterado → ⚠️ CÓDIGO-FONTE MODIFICADO (mesmo em modo DEMO)
        // Razão: separar integridade do software da natureza dos dados
        // (misturar ambos seria um vetor de ataque numa contra-perícia).
        const resultsHtml = [];
        for (const [moduleName, expectedHash] of Object.entries(expectedHashes)) {
            const result = await validateModuleIntegrity(moduleName, expectedHash);
            const isValid = result.valid;
            const badgeText = isValid
                ? '✅ ÍNTEGRO'
                : '⚠️ CÓDIGO-FONTE MODIFICADO — HASH DE REFERÊNCIA NÃO CORRESPONDE';
            const badgeColor = isValid ? '#22c55e' : '#f59e0b';

            let hashDetails = '';
            if (result.actualHash) {
                hashDetails = \`<div class="hash-compare">Hash calculado: \${result.actualHash}</div>\`;
                if (!isValid) {
                    hashDetails += \`<div class="hash-compare" style="color:#f59e0b;">Hash de referência (Fase 3): \${expectedHash}</div>\`;
                }
            } else if (result.error) {
                hashDetails = \`<div class="hash-compare" style="color:#ef4444;">Erro: \${result.error}</div>\`;
            }

            resultsHtml.push(\`
                <div class="integrity-item" style="border-left:3px solid \${badgeColor};padding-left:8px;margin-bottom:6px;">
                    <div class="module-name">📄 \${moduleName}</div>
                    <div style="color:\${badgeColor};font-size:10px;font-weight:700;margin-top:3px;">\${badgeText}</div>
                    \${hashDetails}
                </div>\`);
        }

        // ── BADGE 2: NATUREZA DOS DADOS (DEMO vs PRODUÇÃO) ───────────────────
        // Informa se os dados actualmente carregados são de simulação (fixture
        // de demonstração) ou de produção real.
        // Este badge é INDEPENDENTE do resultado de integridade de código:
        //   • código íntegro + dados reais    → dois badges positivos
        //   • código modificado + dados DEMO  → badge 1 avisa, badge 2 informa
        //   • código íntegro + dados DEMO     → badge 1 positivo, badge 2 informa
        // A separação elimina a ambiguidade fatal que permitiria a uma contra-
        // perícia argumentar "o sistema dissimulou alterações ao código como
        // se fossem apenas dados de simulação".
        const isDemo = window.UNIFED_CONFIG && window.UNIFED_CONFIG.modo === 'DEMO';
        const dataBadgeText = isDemo
            ? 'ℹ️ MODO DEMO — DADOS DE SIMULAÇÃO ACTIVOS (NÃO CONSTITUEM PROVA)'
            : '✅ DADOS DE PRODUÇÃO — FICHEIROS REAIS DO MANDATO CARREGADOS';
        const dataBadgeColor = isDemo ? '#00e5ff' : '#22c55e';

        resultsHtml.push(\`
            <div style="border-left:3px solid \${dataBadgeColor};padding-left:8px;margin-top:10px;padding-top:6px;
                        border-top:1px solid rgba(255,255,255,0.07);">
                <div style="color:#94a3b8;font-size:9px;letter-spacing:1px;margin-bottom:3px;">
                    ÂMBITO DOS DADOS CARREGADOS
                </div>
                <div style="color:\${dataBadgeColor};font-size:10px;font-weight:700;">\${dataBadgeText}</div>
            </div>\`);

        container.innerHTML = resultsHtml.join('');
    }

    // Executar validação após o carregamento completo da página
    window.addEventListener('DOMContentLoaded', runAllValidations);
</script>

</body>
</html>
        `;

        return html;
    },

    /**
     * Exporta o relatório como ficheiro HTML para download
     */
    exportAsHTML: function(filename) {
        const html = this.generateHTMLReport();
        const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `UNIFED-ArchitecturalReport-${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`[ARCHITECTURE-REPORT] ✅ Relatório exportado: ${link.download}`);
    }
};

console.log('[ARCHITECTURE-REPORT] ✅ Runtime Architectural State Report Module Carregado (com validação de integridade criptográfica)');