#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UNIFED-PROBATUM | start_forensic_server.py
Servidor HTTP local (127.0.0.1) para eliminar a limitação "NÃO VERIFICÁVEL
NESTE CONTEXTO" introduzida em F5.2 (unifed_architecture_report.js).

CONTEXTO TÉCNICO
-----------------
Quando index.html é aberto directamente do disco (protocolo file://), o
browser bloqueia fetch() para outros ficheiros locais por política de CORS
— por isso unifed_architecture_report.js::validateModuleIntegrity() nunca
consegue confirmar "✅ ÍNTEGRO" em modo file://, mostrando sempre
"ℹ️ NÃO VERIFICÁVEL NESTE CONTEXTO" (comportamento correcto e não-alarmante,
mas não permite validação positiva).

Servindo os mesmos ficheiros via http://127.0.0.1:<porta>/, fetch() passa a
funcionar normalmente (mesma origem), permitindo que os 8 módulos listados
em MODULE_INTEGRITY sejam efectivamente comparados byte-a-byte contra os
hashes SHA-256 gravados no relatório.

GARANTIAS DE INTEGRIDADE
-------------------------
- Servidor 100% local (bind exclusivo a 127.0.0.1) — nunca expõe a rede
  externa, preservando o requisito AIR-GAPPED do sistema.
- Cabeçalho "Cache-Control: no-store" em TODAS as respostas — impede que o
  browser sirva uma versão em cache de um ficheiro entretanto alterado,
  o que produziria um falso "ÍNTEGRO" ou "DIVERGENTE" desactualizado.
- Sem dependências externas (apenas biblioteca standard do Python 3).
- Sem escrita em disco, sem logging de conteúdo de ficheiros, sem proxy.

UTILIZAÇÃO
----------
    python3 start_forensic_server.py [--port 8420] [--dir .]

Depois abrir no browser:
    http://127.0.0.1:8420/index.html

Para parar o servidor: Ctrl+C.
"""

import argparse
import http.server
import os
import socketserver
import sys
from datetime import datetime, timezone


DEFAULT_PORT = 8420
DEFAULT_HOST = '127.0.0.1'  # Exclusivamente localhost — nunca 0.0.0.0


class ForensicNoStoreHandler(http.server.SimpleHTTPRequestHandler):
    """
    Handler HTTP que força Cache-Control: no-store em todas as respostas
    e regista (em stdout, não em ficheiro) cada pedido com timestamp UTC,
    para fins de auditoria da sessão de demonstração.
    """

    server_version = 'UNIFED-ProbatumForensicServer/1.0'

    def end_headers(self):
        # Cabeçalhos forenses: impedem qualquer cache local que pudesse
        # mascarar uma alteração de ficheiro durante a sessão de demo.
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('X-Forensic-Server', 'UNIFED-PROBATUM-LOCAL')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def log_message(self, format_str, *args):
        ts = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        sys.stderr.write(f'[FORENSIC-SERVER] {ts} | {self.address_string()} | {format_str % args}\n')


class ForensicTCPServer(socketserver.TCPServer):
    # Reutiliza a porta imediatamente após fecho (útil em re-arranques
    # rápidos durante preparação de demonstração), sem afectar segurança
    # já que o bind permanece restrito a 127.0.0.1.
    allow_reuse_address = True


def parse_args():
    parser = argparse.ArgumentParser(
        description='UNIFED-PROBATUM | Servidor HTTP local forense (127.0.0.1, sem cache).'
    )
    parser.add_argument('--port', type=int, default=DEFAULT_PORT,
                         help=f'Porta TCP local (default: {DEFAULT_PORT})')
    parser.add_argument('--dir', type=str, default='.',
                         help='Directório a servir (default: directório actual)')
    return parser.parse_args()


def main():
    args = parse_args()
    target_dir = os.path.abspath(args.dir)

    if not os.path.isdir(target_dir):
        print(f'[ERRO] Directório não encontrado: {target_dir}', file=sys.stderr)
        sys.exit(1)

    os.chdir(target_dir)

    handler = ForensicNoStoreHandler
    with ForensicTCPServer((DEFAULT_HOST, args.port), handler) as httpd:
        print('============================================================')
        print(' UNIFED-PROBATUM | Servidor HTTP Local Forense')
        print('============================================================')
        print(f' Bind exclusivo:   {DEFAULT_HOST} (NUNCA exposto à rede externa)')
        print(f' Porta:            {args.port}')
        print(f' Directório:       {target_dir}')
        print(f' Cache:            Desactivada (Cache-Control: no-store)')
        print(f' URL de acesso:    http://{DEFAULT_HOST}:{args.port}/index.html')
        print('============================================================')
        print(' Ctrl+C para terminar.')
        print('============================================================')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n[FORENSIC-SERVER] Encerrado pelo operador (Ctrl+C).')
            httpd.shutdown()


if __name__ == '__main__':
    main()
