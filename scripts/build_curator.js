const fs = require('fs');

const SRC = './curator_data_inline.js';
const DST = './curator_data_inline.js';

const ANCHOR_12_IDS = new Set([
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
]);

let content = fs.readFileSync(SRC, 'utf8');

// The file has: const POEMS_DATA = [ ... ];
// We can use eval to parse it.
let POEMS_DATA;
try {
  eval(content.replace('const POEMS_DATA', 'POEMS_DATA'));
} catch (e) {
  console.error("Failed to parse", e);
  process.exit(1);
}

for (let p of POEMS_DATA) {
  if (!ANCHOR_12_IDS.has(p.id)) {
    p.body = "";
  }
}

const newContent = "const POEMS_DATA = " + JSON.stringify(POEMS_DATA, null, 2) + ";\n";
fs.writeFileSync(DST, newContent, 'utf8');
console.log("Updated curator_data_inline.js - Lockdown enforced!");
