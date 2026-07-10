"""Convert the two WHO ICD-10-CM <-> ICD-11 mapping spreadsheets into flat CSVs.

Mirrors the existing icd11-xlsx-to-csv.py / icdo4-xlsx-to-csv.py pattern: Python reads the .xlsx and
writes a CSV into database/data/; a JS parse function (opensearch.js) then groups/indexes it.

The raw `icd11Code` combination cells (with `&` and `/`) are preserved verbatim here — the AND/OR
grouping is applied later in opensearch.js (parseIcd10ToIcd11), per assumption A1 in
docs/tickets/NCIATWP-translation-feature/questions.md.
"""

import openpyxl
import csv
import os
import sys

HERE = os.path.dirname(__file__)
TRANSLATION_DIR = os.path.join(HERE, '..', '..', 'docs', 'to-do', 'translation')
DATA_DIR = os.path.join(HERE, '..', 'data')

DEFAULT_10TO11 = os.path.join(TRANSLATION_DIR, 'WHO_ICD10to11_ReviewedLT.xlsx')
DEFAULT_11TO10 = os.path.join(TRANSLATION_DIR, '11to10mapping_ReviewedLT.xlsx')


def clean(value):
    """Normalize a cell to a trimmed string ('' for blanks)."""
    if value is None:
        return ''
    return str(value).strip()


def convert_10to11(input_path, output_path):
    # Sheet columns (0-indexed): 0 10ClassKind, 1 Depth, 2 icd10Code, 3 icd10Chapter, 4 icd10Title,
    # 5 11ClassKind, 6 Depth, 7 Foundation URI, 8 Linearization URI, 9 icd11Code, 10 icd11Chapter,
    # 11 icd11Title.
    wb = openpyxl.load_workbook(input_path, read_only=True)
    ws = wb['10To11MapToMultipleCategories']
    written = 0
    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['icd10Code', 'icd10ClassKind', 'icd10Chapter', 'icd10Title',
                         'icd11Code', 'icd11ClassKind', 'icd11Chapter', 'icd11Title'])
        for row in ws.iter_rows(min_row=2, values_only=True):
            icd10Code = clean(row[2])
            if not icd10Code:
                continue
            writer.writerow([
                icd10Code,
                clean(row[0]),
                clean(row[3]),
                clean(row[4]),
                clean(row[9]),
                clean(row[5]),
                clean(row[10]),
                clean(row[11]),
            ])
            written += 1
    wb.close()
    print(f'10->11: {input_path} -> {output_path} ({written} rows)')


def convert_11to10(input_path, output_path):
    # Sheet columns (0-indexed): 0 Linearization URI, 1 icd11Code, 2 icd11Chapter, 3 icd11Title,
    # 4 icd10Code, 5 icd10Chapter, 6 icd10Title.
    wb = openpyxl.load_workbook(input_path, read_only=True)
    ws = wb['11To10MapToOneCategory']
    written = 0
    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['icd11Code', 'icd11Chapter', 'icd11Title',
                         'icd10Code', 'icd10Chapter', 'icd10Title'])
        for row in ws.iter_rows(min_row=2, values_only=True):
            icd11Code = clean(row[1])
            icd10Code = clean(row[4])
            # Keep only rows that carry an ICD-11 code (blank-code header rows are ICD-11
            # chapters/blocks — deferred per assumption A4; they have no lookup key here).
            if not icd11Code:
                continue
            writer.writerow([
                icd11Code,
                clean(row[2]),
                clean(row[3]),
                icd10Code,
                clean(row[5]),
                clean(row[6]),
            ])
            written += 1
    wb.close()
    print(f'11->10: {input_path} -> {output_path} ({written} rows)')


if __name__ == '__main__':
    in_10to11 = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_10TO11
    in_11to10 = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_11TO10
    convert_10to11(in_10to11, os.path.join(DATA_DIR, 'icd10_to_icd11_mapping.csv'))
    convert_11to10(in_11to10, os.path.join(DATA_DIR, 'icd11_to_icd10_mapping.csv'))
