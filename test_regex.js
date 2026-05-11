const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(anh)([^\\p{L}\\p{N}_]|$)`, 'iu');
console.log(regex.test("nhanh")); // false
console.log(regex.test("anh yêu em")); // true
console.log(regex.test("yêu anh")); // true
console.log(regex.test("yêu anh, em")); // true
console.log(regex.test("canh")); // false

const regexTim = new RegExp(`(^|[^\\p{L}\\p{N}_])(tim)([^\\p{L}\\p{N}_]|$)`, 'iu');
console.log(regexTim.test("trái tim")); // true
console.log(regexTim.test("đi tìm")); // false
console.log(regexTim.test("màu tím")); // false
console.log(regexTim.test("tim.")); // true
