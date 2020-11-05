"use strict";

var _crc = require("./crc");

describe('PBXCrc', function () {
  it('matches updateBytes Java implementation', function () {
    var crc = new _crc.PBXCrc();
    crc.updateBytes([0x55, 0x50, 0x58, 0x4c, 0x00, 0x01, 0x03, 0x24, 0x01, 0x00, 0xff, 0x00, 0x00, 0xdd, 0x03, 0xd6, 0x83], 0, 13);
    expect(crc.sum).toBe(2083126306);
  });
  it('handles nonzero start values in updateBytes', function () {
    var crc = new _crc.PBXCrc();
    crc.updateBytes([0x69, 0x55, 0x50, 0x58, 0x4c, 0x00, 0x01, 0x03, 0x24, 0x01, 0x00, 0xff, 0x00, 0x00, 0xdd, 0x03, 0xd6, 0x83], 1, 14);
    expect(crc.sum).toBe(2083126306);
  });
  it('matches writeInvSum Java implementation', function () {
    var crc = new _crc.PBXCrc();
    crc.updateBytes([0x55, 0x50, 0x58, 0x4c, 0x00, 0x02]);
    var result = Buffer.alloc(_crc.CRC_SIZE);
    crc.writeInvSum(result, 0);
    expect(result).toEqual(Buffer.from([0xe9, 0xc5, 0xa5, 0x4c]));
  });
  it('matches toBytes Java implementation', function () {
    var crc = new _crc.PBXCrc();
    crc.updateBytes([0x55, 0x50, 0x58, 0x4c, 0x00, 0x02]);
    expect(crc.toBytes()).toEqual(Buffer.from([0xe9, 0xc5, 0xa5, 0x4c]));
  });
});