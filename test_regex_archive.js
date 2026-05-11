const fs = require('fs');

const code = fs.readFileSync('curator_data_inline.js', 'utf8').replace(/const POEMS_DATA/g, 'var POEMS_DATA');
eval(code); 

function getEff(p) { return p.curatorOverride || p.aiSuggestion || {}; }

const poems = JSON.parse(JSON.stringify(POEMS_DATA));

let timMatches = 0;
let names = [];
let queryStr = "tim";
const safeQuery = queryStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(${safeQuery})([^\\p{L}\\p{N}_]|$)`, 'iu');

poems.forEach(p => {
  let st = p.title + ' ' + (p.body || '');
  if (regex.test(st)) {
    timMatches++;
    names.push(p.title);
  }
});

console.log("Matches:", timMatches);
console.log("Names:", names);

let anhMatches = 0;
const safeAnh = "anh".replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regexAnh = new RegExp(`(^|[^\\p{L}\\p{N}_])(${safeAnh})([^\\p{L}\\p{N}_]|$)`, 'iu');
poems.forEach(p => {
  let st = p.title + ' ' + (p.body || '');
  if (regexAnh.test(st)) {
    anhMatches++;
  }
});
console.log("Anh matches:", anhMatches);

