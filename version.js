/**
 * ============================================================================
 * UNIFED-PROBATUM | VERSION MANIFEST (patch_unifed_macro_v13 — P13)
 * ============================================================================
 * Fonte única de verdade para a versão do sistema.
 * Carregado PRIMEIRO em index.html (antes de qualquer outro script).
 * Norma: D.L. n.º 28/2019 — rastreabilidade de versões de software técnico-jurídica.
 * ============================================================================
 */
window.UNIFED_VERSION = Object.freeze({
    full:    'v1.0-COMMERCIAL-LITIGATION-P3.1',
    major:   1,
    minor:   0,
    patch:   3,
    build:   '2026-06-13',
    corte:   'v1.0-COMMERCIAL-LITIGATION',
    // Histórico de patches para rastreabilidade forense (D.L. n.º 28/2019)
    history: Object.freeze([
        { patch: 'P13',   build: '2025-03-15', desc: 'Versão inicial COMMERCIAL-LITIGATION' },
        { patch: 'P3.1a', build: '2026-06-12', desc: 'Substituição léxica global (164 ocorrências); guard Merkle; Z-Score IC99%; scrubbing V8; TSA config' },
        { patch: 'P3.1b', build: '2026-06-13', desc: 'Cirurgias 1-5: TOP3_READY; Z-Score integrado; operatorToken; rota TSA 502/504; alerta forense' },
        { patch: 'P3.1c', build: '2026-06-13', desc: 'Hash UPPERCASE normalizado; checksum dinâmico; PATCH_REGISTRY actualizado; sintaxe JS validada' }
    ])
});
console.log('[UNIFED-VERSION] ✅ Version manifest carregado:', window.UNIFED_VERSION.full);
