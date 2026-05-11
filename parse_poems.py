import json
import re

with open('thoHanhLoan_Cleaned.md', 'r') as f:
    lines = f.readlines()

poems_md = {}
current_title = None
current_body = []

def clean_title(t):
    t = re.sub(r'^\d+\.\s*', '', t)
    return t.strip().upper()

for line in lines:
    if line.startswith('### '):
        if current_title:
            poems_md[current_title] = '\n'.join(current_body).strip()
        current_title = clean_title(line[4:])
        current_body = []
    elif current_title is not None:
        current_body.append(line.rstrip('\n'))

if current_title:
    poems_md[current_title] = '\n'.join(current_body).strip()

print(f"Extracted {len(poems_md)} poems from Markdown.")

def normalize_title(t):
    # Remove punctuation, spaces, to lower
    return re.sub(r'[\W_]+', '', t).lower()

md_keys = {normalize_title(k): k for k in poems_md.keys()}

with open('poems-inferred.json', 'r') as f:
    poems = json.load(f)

filled_count = 0
for p in poems:
    if p.get('isStub'):
        t_norm = normalize_title(p['title'])
        if t_norm in md_keys:
            orig_key = md_keys[t_norm]
            body = poems_md[orig_key]
            if body:
                p['body'] = body
                lines = [l for l in body.split('\n') if l.strip() and not l.startswith('*')]
                p['excerpt'] = '\n'.join(lines[:3])
                p['isStub'] = False
                filled_count += 1
        else:
            print(f"Could not find MD for stub: {p['title']}")

print(f"Filled {filled_count} stubs.")

with open('poems-inferred.json', 'w') as f:
    json.dump(poems, f, indent=2, ensure_ascii=False)

# ── ANCHOR LOCKDOWN ──────────────────────────────────────────────────────────
ANCHOR_12_IDS = {
    '2016-008-vui',
    '2023-078-thoi-gian-va-tinh-yeu',
    '2022-038-binh-minh-em-va-hoang-hon-anh',
    '2020-020-boi-vi-em-yeu-anh',
    '2023-083-bon-mua-co-con-nhau',
    '2023-074-nang-i',
    '2022-040-hai-mien-thang-5',
    '2022-067-ben-nay-ben-kia',
    '2022-032-tra-anh-ve-phia-binh-minh',
    '2023-102-thang-12-cho-em',
    '2022-047-bay-gio-thang-tam-roi-anh',
    '2023-082-mua-he-o-boston',
}

# Update inline js - Strip body for non-anchor poems
js_poems = json.loads(json.dumps(poems)) # Deep copy
for p in js_poems:
    if p.get('id') not in ANCHOR_12_IDS:
        p['body'] = ""

js_content = "const POEMS_DATA = " + json.dumps(js_poems, indent=2, ensure_ascii=False) + ";\n"
with open('curator_data_inline.js', 'w') as f:
    f.write(js_content)
print("Updated curator_data_inline.js (with lockdown enforcement)")
