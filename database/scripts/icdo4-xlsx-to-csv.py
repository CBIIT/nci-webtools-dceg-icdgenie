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

with open(output_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['code', 'level', 'preferred', 'description', 'codeReference'])

    for row in ws.iter_rows(min_row=3, values_only=True):  # Skip row 1 (title) and row 2 (column names)
        code = row[0]
        level = row[1]
        term = row[2]
        code_ref = row[3]

        # Skip hierarchy header rows (numeric levels) and empty rows
        if code is None or level is None:
            continue
        if isinstance(level, (int, float)):
            continue
        if level not in ('Preferred', 'Synonym', 'Related'):
            continue

        preferred = '1' if level == 'Preferred' else '0'

        # Strip parentheses from code reference
        clean_ref = ''
        if code_ref:
            clean_ref = str(code_ref).strip()
            if clean_ref.startswith('(') and clean_ref.endswith(')'):
                clean_ref = clean_ref[1:-1].strip()

        writer.writerow([str(code), level, preferred, term or '', clean_ref])

wb.close()
print(f'Converted {input_path} -> {output_path}')
