#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os

SRC = '/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/poems-curated.json'
DST = '/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/curator_data_inline.js'

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

def main():
    with open(SRC, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Clean invalid JSON escape sequences like \Nắng -> Nắng
    # In JSON string, `\` followed by `N` is `\\N`
    content = content.replace('\\N', 'N')
    
    poems = json.loads(content)
        
    for p in poems:
        if p.get('id') not in ANCHOR_12_IDS:
            p['body'] = ""
            
    js_content = "const POEMS_DATA = " + json.dumps(poems, indent=2, ensure_ascii=False) + ";\n"
    
    with open(DST, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Updated {DST} - Stripped body for non-anchor poems (Lockdown enforced).")

if __name__ == '__main__':
    main()
