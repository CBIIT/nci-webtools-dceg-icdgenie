import openpyxl
import csv
import re
import sys
import os

# Default paths
DEFAULT_INPUT = os.path.join(os.path.dirname(__file__), '..', '..', 'docs', 'tickets', 'data', 'raw', 'WHO_ICD11.xlsx')
DEFAULT_OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'icd11.csv')

input_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
output_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUTPUT

wb = openpyxl.load_workbook(input_path, read_only=True)
ws = wb.active

def extract_entity_id(uri):
    """Extract numeric entity ID from Foundation URI."""
    if not uri:
        return ''
    return uri.strip().split('/')[-1]

def strip_dashes(title):
    """Remove leading dashes and whitespace from title (per ticket assumption #2)."""
    if not title:
        return ''
    return re.sub(r'^[\s\-]+', '', title)

with open(output_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['entityId', 'code', 'title', 'classKind', 'depthInKind', 'chapterNo', 'parentEntityId'])

    skipped = 0
    written = 0
    for row in ws.iter_rows(min_row=2, values_only=True):  # Skip header row
        foundation_uri = row[0]   # Column 1: Foundation URI
        code = row[2]             # Column 3: Code
        title = row[4]            # Column 5: Title
        class_kind = row[5]       # Column 6: ClassKind
        depth = row[6]            # Column 7: DepthInKind
        chapter_no = row[8]       # Column 9: ChapterNo
        parent_uri = row[18]      # Column 19: Parent

        entity_id = extract_entity_id(foundation_uri)
        parent_entity_id = extract_entity_id(parent_uri)

        # Skip rows without entity IDs
        if not entity_id:
            skipped += 1
            continue

        writer.writerow([
            entity_id,
            code or '',
            strip_dashes(title or ''),
            class_kind or '',
            depth or '',
            chapter_no or '',
            parent_entity_id
        ])
        written += 1

wb.close()
print(f'Converted {input_path} -> {output_path}')
print(f'Written: {written}, Skipped (no entity ID): {skipped}')
