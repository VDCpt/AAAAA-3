#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UNIFED-PROBATUM | gerar_relatorio_pericial.py
Gerador determinístico de RELATÓRIO DE VERIFICAÇÃO DE INTEGRIDADE (hashes)
a partir dos ficheiros de código do lote, para verificação externa
independente — complementar, não substitutivo, do Parecer Técnico Forense
(documento jurídico-narrativo gerado em runtime pelo browser, via
unifed_triada_export.js + pdfMake, com base na análise de evidências
efectivamente carregadas).

ÂMBITO E LIMITAÇÃO DECLARADA (leitura obrigatória)
----------------------------------------------------
Este script NÃO reconstrói o conteúdo jurídico-narrativo do Parecer
Técnico Forense (factos do caso, valores BTOR/BTF, cenários de IVA,
questionário TOP3, etc.) — esse documento depende de dados de evidências
carregadas em runtime no browser (ficheiros SAF-T, extratos, DAC7,
faturas) que não estão disponíveis a um script standalone.

O que este script GARANTE, de forma determinística e reproduzível:
  1. Recalcula o SHA-256 (lowercase) de cada um dos ficheiros de código
     do lote, a partir do disco — não confia em valores hardcoded.
  2. Recalcula o Master Hash do lote pelo MESMO método usado em todas as
     Fases desta sessão (SHA-256 da concatenação ordenada das linhas
     "<hash>␣␣<nome_ficheiro>", formato sha256sum).
  3. Compara o resultado com o Master Hash homologado (parâmetro
     --expected-hash), reportando coincidência ou divergência byte-a-byte.
  4. Produz um PDF de verificação (ou, na ausência de reportlab, um
     relatório de texto equivalente) com timestamp UTC da execução,
     adequado para anexar como prova de reprodutibilidade externa.

Este documento serve o propósito de "verificabilidade externa" referido
no pedido original: qualquer perito da contraparte pode correr este
mesmo script, sobre o mesmo lote de ficheiros, e obter exactamente o
mesmo Master Hash — sem depender de o sistema visual (browser) estar
operacional, sem necessitar de JavaScript, e sem qualquer dependência
de rede.

UTILIZAÇÃO
----------
    python3 gerar_relatorio_pericial.py \\
        --dir . \\
        --expected-hash <MASTER_HASH_HOMOLOGADO> \\
        --output relatorio_verificacao_integridade.pdf

Sem --expected-hash, o script apenas calcula e reporta o hash actual,
sem fazer comparação de conformidade.
"""

import argparse
import hashlib
import os
import sys
from datetime import datetime, timezone


# Lote de referência (Fase 10 / F10 em diante) — os 11 ficheiros de código
# que compõem o Master Hash do sistema UNIFED-PROBATUM. Ordem IMPORTA: o
# Master Hash depende da ordem de concatenação, que deve ser idêntica à
# usada em todas as entregas desta sessão (UNIFED_STATE.md / Manifesto).
CODE_FILES = [
    'script.js',
    'translations.js',
    'unifed_questionnaire_50questions.js',
    'unifed_contraperiria_export.js',
    'unifed_triada_export.js',
    'enrichment.js',
    'nexus.js',
    'version.js',
    'unifed_merkle_engine.js',
    'unifed_architecture_report.js',
    'index.html',
]


def sha256_of_file(path):
    """SHA-256 (hex, lowercase) do conteúdo binário do ficheiro."""
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()


def compute_master_hash(base_dir, files):
    """
    Replica EXACTAMENTE o método usado em todas as Fases desta sessão:
      1. Para cada ficheiro, calcular "<sha256_lowercase>␣␣<nome>" (formato
         idêntico à saída de `sha256sum`, dois espaços como separador).
      2. Concatenar essas linhas, terminadas em \\n, por ordem de 'files'.
      3. SHA-256 dessa concatenação == Master Hash do lote (lowercase).
    """
    lines = []
    individual = {}
    missing = []
    for fname in files:
        fpath = os.path.join(base_dir, fname)
        if not os.path.isfile(fpath):
            missing.append(fname)
            continue
        digest = sha256_of_file(fpath)
        individual[fname] = digest
        lines.append(f'{digest}  {fname}')

    if missing:
        raise FileNotFoundError(
            'Ficheiro(s) em falta no directório indicado: ' + ', '.join(missing)
        )

    combined = '\n'.join(lines) + '\n'
    master = hashlib.sha256(combined.encode('utf-8')).hexdigest()
    return master.upper(), individual


def build_pdf_report(output_path, base_dir, individual_hashes, master_hash,
                      expected_hash, match, timestamp_utc):
    """Gera o PDF de verificação usando reportlab, se disponível."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    except ImportError:
        return False

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'UnifedTitle', parent=styles['Title'], fontSize=14, spaceAfter=6
    )
    mono_style = ParagraphStyle(
        'UnifedMono', parent=styles['Normal'], fontName='Courier', fontSize=7,
        leading=9
    )
    normal_style = styles['Normal']

    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        topMargin=18 * mm, bottomMargin=18 * mm,
        leftMargin=16 * mm, rightMargin=16 * mm
    )
    story = []

    story.append(Paragraph('UNIFED-PROBATUM', title_style))
    story.append(Paragraph(
        'Relatório de Verificação Determinística de Integridade (SHA-256)',
        styles['Heading2']
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f'Gerado em (UTC): {timestamp_utc}',
        normal_style
    ))
    story.append(Paragraph(
        'Método: SHA-256 individual por ficheiro (sha256sum) + SHA-256 da '
        'concatenação ordenada das linhas resultantes (Master Hash).',
        normal_style
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph('Anexo de Evidências (ficheiros do lote)', styles['Heading3']))
    table_data = [['ID', 'FICHEIRO', 'SHA-256 (lowercase)']]
    for i, (fname, digest) in enumerate(individual_hashes.items(), start=1):
        table_data.append([f'EV-{i:02d}', fname, digest])

    tbl = Table(table_data, colWidths=[16 * mm, 60 * mm, 95 * mm])
    tbl.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 6.5),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (2, 1), (2, -1), 'Courier'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 14))

    story.append(Paragraph('Master Hash do Lote', styles['Heading3']))
    story.append(Paragraph(f'<font face="Courier">{master_hash}</font>', mono_style))
    story.append(Spacer(1, 8))

    if expected_hash:
        status_txt = '✅ COINCIDE COM O HASH HOMOLOGADO' if match else '⚠️ DIVERGE DO HASH HOMOLOGADO — INVESTIGAR'
        status_color = colors.HexColor('#16a34a') if match else colors.HexColor('#dc2626')
        story.append(Paragraph('Verificação de Conformidade', styles['Heading3']))
        story.append(Paragraph(f'Hash homologado (esperado): <font face="Courier">{expected_hash}</font>', mono_style))
        story.append(Paragraph(f'Hash calculado (actual):    <font face="Courier">{master_hash}</font>', mono_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(
            f'<font color="{status_color.hexval() if hasattr(status_color,"hexval") else "#000000"}"><b>{status_txt}</b></font>',
            normal_style
        ))

    story.append(Spacer(1, 16))
    story.append(Paragraph(
        'NOTA DE ÂMBITO: este documento certifica exclusivamente a '
        'integridade criptográfica (SHA-256) dos ficheiros de código-fonte '
        'do lote. Não reproduz o conteúdo jurídico-narrativo do Parecer '
        'Técnico Forense (que depende de dados de evidências processados '
        'em runtime no browser). Reprodutível por qualquer terceiro, '
        'correndo este mesmo script sobre o mesmo lote de ficheiros, sem '
        'dependência de rede ou de estado de sessão do browser.',
        ParagraphStyle('Nota', parent=normal_style, fontSize=8, textColor=colors.grey)
    ))

    doc.build(story)
    return True


def build_text_report(output_path, individual_hashes, master_hash,
                       expected_hash, match, timestamp_utc):
    """Fallback sem dependências: relatório de texto simples (sempre funciona)."""
    lines = []
    lines.append('=' * 78)
    lines.append(' UNIFED-PROBATUM | RELATÓRIO DE VERIFICAÇÃO DE INTEGRIDADE (SHA-256)')
    lines.append('=' * 78)
    lines.append(f' Gerado em (UTC): {timestamp_utc}')
    lines.append('')
    lines.append(' ANEXO DE EVIDÊNCIAS (ficheiros do lote)')
    lines.append('-' * 78)
    for i, (fname, digest) in enumerate(individual_hashes.items(), start=1):
        lines.append(f' EV-{i:02d}  {fname:<40s} {digest}')
    lines.append('-' * 78)
    lines.append('')
    lines.append(f' MASTER HASH DO LOTE: {master_hash}')
    lines.append('')
    if expected_hash:
        status = 'COINCIDE COM O HASH HOMOLOGADO' if match else 'DIVERGE DO HASH HOMOLOGADO — INVESTIGAR'
        lines.append(f' Hash homologado (esperado): {expected_hash}')
        lines.append(f' Hash calculado (actual):    {master_hash}')
        lines.append(f' Estado: {status}')
        lines.append('')
    lines.append(' NOTA DE ÂMBITO: ver docstring do script para limitações declaradas.')
    lines.append('=' * 78)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')


def parse_args():
    parser = argparse.ArgumentParser(
        description='UNIFED-PROBATUM | Gerador determinístico de relatório de verificação de integridade.'
    )
    parser.add_argument('--dir', type=str, default='.',
                         help='Directório contendo os ficheiros do lote (default: directório actual)')
    parser.add_argument('--expected-hash', type=str, default=None,
                         help='Master Hash homologado, para comparação de conformidade (opcional)')
    parser.add_argument('--output', type=str, default='relatorio_verificacao_integridade.pdf',
                         help='Caminho de saída do relatório (default: relatorio_verificacao_integridade.pdf)')
    return parser.parse_args()


def main():
    args = parse_args()
    base_dir = os.path.abspath(args.dir)
    timestamp_utc = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%fZ')

    print('============================================================')
    print(' UNIFED-PROBATUM | Verificação Determinística de Integridade')
    print('============================================================')
    print(f' Directório: {base_dir}')
    print(f' Ficheiros:  {len(CODE_FILES)}')
    print('')

    try:
        master_hash, individual = compute_master_hash(base_dir, CODE_FILES)
    except FileNotFoundError as e:
        print(f'[ERRO] {e}', file=sys.stderr)
        sys.exit(1)

    for fname, digest in individual.items():
        print(f'  {digest}  {fname}')

    print('')
    print(f' MASTER HASH CALCULADO: {master_hash}')

    expected = args.expected_hash.strip().upper() if args.expected_hash else None
    match = (expected == master_hash) if expected else None

    if expected:
        print(f' MASTER HASH HOMOLOGADO: {expected}')
        print(f' CONFORMIDADE: {"✅ COINCIDE" if match else "⚠️  DIVERGE"}')

    pdf_ok = False
    output_path = args.output
    if output_path.lower().endswith('.pdf'):
        pdf_ok = build_pdf_report(
            output_path, base_dir, individual, master_hash, expected, match, timestamp_utc
        )
        if not pdf_ok:
            print('[AVISO] reportlab indisponível — a gerar relatório de texto em alternativa.', file=sys.stderr)
            output_path = os.path.splitext(output_path)[0] + '.txt'

    if not pdf_ok:
        build_text_report(output_path, individual, master_hash, expected, match, timestamp_utc)

    print('')
    print(f' Relatório escrito em: {output_path}')
    print('============================================================')

    if expected and not match:
        sys.exit(2)


if __name__ == '__main__':
    main()
