// function fmt_uint8(n) {
//     return `0x${(n >>> 0).toString(16).padStart(2, '0')} `
//         + `(0b${(n >>> 0).toString(2).padStart(8, '0')} => ${(n >>> 0).toString(10)})`;
// }
// function fmt_uint32(n) {
//     return `0x${(n >>> 0).toString(16).padStart(8, '0')} `
//         + `(0b${(n >>> 0).toString(2).padStart(32, '0')} => ${(n >>> 0).toString(10)})`;
// }
export function fmt_array_uint8(arr, indices = []) {
    const hex = arr.reduce((col, b, idx) => {
        return col + (indices.includes(idx) ? '|' : '') + (b >>> 0).toString(16).padStart(2, '0');
    }, '');
    return `0x${hex} (${arr.length})`;
}
