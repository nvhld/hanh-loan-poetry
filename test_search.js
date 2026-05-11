const fs = require('fs');
const data = JSON.parse(fs.readFileSync('poems-curated.json', 'utf8'));
function removeDiacritics(str) {
  // same logic as archive.html
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
const matches = data.filter(p => {
  const text = removeDiacritics(p.title + ' ' + (p.body || ''));
  return text.includes("tim");
});
console.log("Found " + matches.length + " poems with 'tim'");
matches.forEach(m => console.log(m.title));
