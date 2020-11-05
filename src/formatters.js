"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fmt_array_uint8 = fmt_array_uint8;

// function fmt_uint8(n) {
//     return `0x${(n >>> 0).toString(16).padStart(2, '0')} `
//         + `(0b${(n >>> 0).toString(2).padStart(8, '0')} => ${(n >>> 0).toString(10)})`;
// }
// function fmt_uint32(n) {
//     return `0x${(n >>> 0).toString(16).padStart(8, '0')} `
//         + `(0b${(n >>> 0).toString(2).padStart(32, '0')} => ${(n >>> 0).toString(10)})`;
// }
function fmt_array_uint8(arr) {
  var indices = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var hex = arr.reduce(function (col, b, idx) {
    return col + (indices.includes(idx) ? '|' : '') + (b >>> 0).toString(16).padStart(2, '0');
  }, '');
  return "0x".concat(hex, " (").concat(arr.length, ")");
}