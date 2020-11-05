"use strict";

var _header = require("./header");

var _constants = require("./constants");

describe('PBXHeader', function () {
  it('serializes basic headers', function () {
    var basicHeader = new _header.PBXHeader(10, _constants.PBX_RECORD_TYPES.SET_CHANNEL_APA102_DATA);
    var basicHeaderBytes = basicHeader.toBytes();
    expect(basicHeaderBytes.length).toBe(_header.HEADER_SIZE);
    expect(basicHeaderBytes).toEqual(Buffer.from([0x55, 0x50, 0x58, 0x4c, 0x0a, 0x03]));
  });
  it('handles invalid channels', function () {
    expect(function () {
      new _header.PBXHeader(-1, _constants.PBX_RECORD_TYPES.DRAW_ALL);
    }).toThrow(Error);
    expect(function () {
      new _header.PBXHeader(64, _constants.PBX_RECORD_TYPES.DRAW_ALL);
    }).toThrow(Error);
  });
});