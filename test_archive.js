const fs = require('fs');

const code = fs.readFileSync('curator_data_inline.js', 'utf8').replace(/const POEMS_DATA/g, 'var POEMS_DATA');
eval(code); 

function removeDiacritics(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const poems = JSON.parse(JSON.stringify(POEMS_DATA));
let matches = 0;
let names = [];
poems.forEach(p => {
  const text = removeDiacritics(p.title + ' ' + (p.body || ''));
  if (text.includes("tim")) {
    matches++;
    names.push(p.title);
  }
});
console.log("Matches:", matches);
console.log("Names:", names);
