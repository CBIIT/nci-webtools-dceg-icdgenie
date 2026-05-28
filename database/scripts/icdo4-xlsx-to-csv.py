import openpyxl
import csv
import sys
import os

# Default paths
DEFAULT_INPUT = os.path.join(os.path.dirname(__file__), '..', '..', 'docs', 'tickets', 'data', 'raw', 'ICD-O-4.xlsx')
DEFAULT_OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'icdo4_morphology.csv')

input_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
output_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUTPUT

wb = openpyxl.load_workbook(input_path, read_only=True)
ws = wb['a) Morphology']

def clean_code_ref(code_ref):
    """Strip parentheses from code reference."""
    if not code_ref:
        return ''
    clean = str(code_ref).strip()
    if clean.startswith('(') and clean.endswith(')'):
        clean = clean[1:-1].strip()
    return clean

with open(output_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['code', 'level', 'preferred', 'term', 'codeReference', 'obs', 'seeAlso', 'excludes', 'other', 'description'])

    written = 0
    for row in ws.iter_rows(min_row=3, values_only=True):  # Skip row 1 (title) and row 2 (column names)
        code = row[0]
        level = row[1]
        term = row[2]
        code_ref = row[3]
        obs = row[4]
        see_also = row[5]
        excludes = row[6]
        other = row[7]

        # Skip hierarchy header rows (numeric levels) and empty rows
        if code is None or level is None:
            continue
        if isinstance(level, (int, float)):
            continue
        if level not in ('Preferred', 'Synonym', 'Related'):
            continue

        preferred = '1' if level == 'Preferred' else '0'
        clean_ref = clean_code_ref(code_ref)

        # Build combined description from all fields, skipping empty ones
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
            description
        ])
        written += 1

wb.close()
print(f'Converted {input_path} -> {output_path}')
print(f'Written: {written} rows')
