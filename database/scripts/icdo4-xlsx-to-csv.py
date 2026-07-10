import openpyxl
import csv
import sys
import os

# Default paths
DEFAULT_INPUT = os.path.join(os.path.dirname(__file__), '..', '..', 'docs', 'tickets', 'data', 'raw', 'ICD-O-4.xlsx')
DEFAULT_OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'icdo4_morphology.csv')

input_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
output_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUTPUT

# One entry per sheet. Column indices differ per sheet: the topography sheets
# insert a "Note" column (index 3), shifting Code reference to 4 and pushing
# Excludes/Other text to 9/10; the optional sheet also renames the first two
# columns and adds a trailing "New" column. So each sheet needs its own map.
SHEETS = [
    {
        'name': 'a) Morphology',
        'type': 'Morphology',
        'cols': {'code': 0, 'level': 1, 'term': 2, 'code_ref': 3, 'obs': 4, 'see_also': 5, 'excludes': 6, 'other': 7},
        'allow_preferred': True,
    },
    {
        'name': 'b) Topography',
        'type': 'Topography',
        'cols': {'code': 0, 'level': 1, 'term': 2, 'code_ref': 4, 'obs': 5, 'see_also': 6, 'excludes': 9, 'other': 10},
        'allow_preferred': True,
    },
    {
        'name': 'c) Topography optional',
        'type': 'Topography Optional',
        'cols': {'code': 0, 'level': 1, 'term': 2, 'code_ref': 4, 'obs': 5, 'see_also': 6, 'excludes': 9, 'other': 10},
        'allow_preferred': False,
    },
]


def clean_code_ref(code_ref):
    """Strip parentheses from code reference."""
    if not code_ref:
        return ''
    clean = str(code_ref).strip()
    if clean.startswith('(') and clean.endswith(')'):
        clean = clean[1:-1].strip()
    return clean


def cell(row, idx):
    """Safe cell access (topography rows can be shorter than the widest column)."""
    return row[idx] if idx < len(row) else None


def process_sheet(ws, cols, type_label, allow_preferred, writer):
    written = 0
    for row in ws.iter_rows(min_row=3, values_only=True):  # Skip row 1 (title) and row 2 (headers)
        code = cell(row, cols['code'])
        level = cell(row, cols['level'])

        # Skip hierarchy header rows (numeric levels) and rows without a code/level
        if code is None or level is None:
            continue
        if isinstance(level, (int, float)):
            continue
        # Include ALL text level types (Preferred, Synonym, Related, Related list, Bullet, ...)

        term = cell(row, cols['term'])
        code_ref = cell(row, cols['code_ref'])
        obs = cell(row, cols['obs'])
        see_also = cell(row, cols['see_also'])
        excludes = cell(row, cols['excludes'])
        other = cell(row, cols['other'])

        preferred = '1' if (allow_preferred and level == 'Preferred') else '0'
        clean_ref = clean_code_ref(code_ref)

        # Build combined description from the same fields as morphology, skipping empty ones
        parts = [
            str(term or ''),
            f'({clean_ref})' if clean_ref else '',
            str(obs or ''),
            str(see_also or ''),
            str(excludes or ''),
            str(other or ''),
        ]
        description = ' '.join(p for p in parts if p)

        writer.writerow([
            str(code), level, preferred,
            term or '', clean_ref,
            obs or '', see_also or '', excludes or '', other or '',
            description, type_label,
        ])
        written += 1
    return written


wb = openpyxl.load_workbook(input_path, read_only=True)

with open(output_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['code', 'level', 'preferred', 'term', 'codeReference', 'obs', 'seeAlso', 'excludes', 'other', 'description', 'type'])

    total = 0
    for sheet in SHEETS:
        ws = wb[sheet['name']]
        n = process_sheet(ws, sheet['cols'], sheet['type'], sheet['allow_preferred'], writer)
        print(f"  {sheet['name']:<24} -> {sheet['type']:<20} {n} rows")
        total += n

wb.close()
print(f'Converted {input_path} -> {output_path}')
print(f'Written: {total} rows total')
