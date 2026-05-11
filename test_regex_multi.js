const safeQuery = "những bài ở".replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(${safeQuery})([^\\p{L}\\p{N}_]|$)`, 'iu');
console.log(regex.test("có những bài ở lại")); // true
console.log(regex.test("những bài ở")); // true
console.log(regex.test("những bài ởa")); // false
