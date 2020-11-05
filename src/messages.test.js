"use strict";

var _crc = require("./crc");

var _header = require("./header");

var _colorOrder = require("./colorOrder");

var _constants = require("./constants");

var _messages = require("./messages");

describe('PBXMessage', function () {
  it('writes basic drawall header with writeHeader', function () {
    var message = new _messages.PBXMessage(0, 0, _constants.PBX_RECORD_TYPES.DRAW_ALL);
    expect(message.buffer).toEqual(Buffer.from([0x55, 0x50, 0x58, 0x4c, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00]));
  });
  it('updates CRC for basic drawall header with updateCrc', function () {
    var message = new _messages.PBXMessage(0, 0, _constants.PBX_RECORD_TYPES.DRAW_ALL);
    message.updateCrc();
    expect(_messages.MESSAGE_CRC.sum >>> 0).toEqual(3009034774 >>> 0);
  });
  it('writes CRC for basic drawall message with writeCrc', function () {
    var message = new _messages.PBXMessage(0, 0, _constants.PBX_RECORD_TYPES.DRAW_ALL);
    _messages.MESSAGE_CRC.sum = 3009034774 >>> 0;
    message.writeCrc();
    expect(message.buffer.slice(message.size - _crc.CRC_SIZE, message.size)).toEqual(Buffer.from([0xe9, 0xc5, 0xa5, 0x4c]));
  });
});
describe('PBXDrawAllMessage', function () {
  it('serializes a basic draw all message', function () {
    var message = new _messages.PBXDrawAllMessage();
    expect(message.toBytes()).toEqual(Buffer.from([0x55, 0x50, 0x58, 0x4c, 0x00, 0x02, 0xe9, 0xc5, 0xa5, 0x4c]));
  });
});
describe('PBXWS281XMessage', function () {
  it('writes base correctly', function () {
    var message = new _messages.PBXWS281XMessage(1, _colorOrder.PBX_COLOR_ORDERS.RGB, 1);
    message.writeBase();
    expect(message.buffer.slice(_header.HEADER_SIZE, _header.HEADER_SIZE + 4)).toEqual(Buffer.from([0x03, 0x24, 0x01, 0x00]));
  });
  it('serializes a basic WS281X message with single red', function () {
    var message = new _messages.PBXWS281XMessage(0, _colorOrder.PBX_COLOR_ORDERS.RGB, 1);
    message.setPixels([[0xff, 0x00, 0x00]]);
    expect(message.toBytes()).toEqual(Buffer.from([0x55, 0x50, 0x58, 0x4c, 0x00, 0x01, 0x03, 0x24, 0x01, 0x00, 0xff, 0x00, 0x00, 0xdd, 0x03, 0xd6, 0x83]));
  });
});