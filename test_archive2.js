const fs = require('fs');

const code = fs.readFileSync('curator_data_inline.js', 'utf8').replace(/const POEMS_DATA/g, 'var POEMS_DATA');
eval(code); 

function getEff(p) { return p.curatorOverride || p.aiSuggestion || {}; }

const poems = JSON.parse(JSON.stringify(POEMS_DATA));

const groups = {
  memory: [], distance: [], entropy: [], longing: [], eros: [], ecstasy: [], other: []
};

poems.forEach(p => {
  const eff = getEff(p);
  let dom = eff.dominantField || 'other';
  if (!groups[dom]) dom = 'other';
  groups[dom].push(p);
});

let totalRows = 0;
let timMatches = 0;
let names = [];

function removeDiacritics(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

Object.entries(groups).forEach(([key, list]) => {
  if (!list || list.length === 0) return;
  list.forEach(p => {
    totalRows++;
    let st = removeDiacritics(p.title + ' ' + (p.body || ''));
    if (st.includes("tim")) {
      timMatches++;
      names.push(p.title);
    }
  });
});

console.log("Total rows:", totalRows);
console.log("Matches:", timMatches);
console.log("First 5 names:", names.slice(0,5));
