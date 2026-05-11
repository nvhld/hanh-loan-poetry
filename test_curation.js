const fs = require('fs');
const code = fs.readFileSync('curator_data_inline.js', 'utf8');
eval(code); // defines POEMS_DATA and CurationGroups

function removeDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

let curatedIds = [];
Object.values(CurationGroups).forEach(g => {
  curatedIds.push(...g.poems);
});

console.log("Total curated IDs:", curatedIds.length);

let matches = [];
curatedIds.forEach(id => {
  const p = POEMS_DATA.find(x => x.id === id);
  if (p) {
    const text = removeDiacritics(p.title + ' ' + (p.body || ''));
    if (text.includes("tim")) {
      matches.push(p.title);
    }
  }
});

console.log("Matches in curation groups:", matches.length);
matches.forEach(t => console.log(t));

