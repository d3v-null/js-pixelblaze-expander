"use strict";

var _colorOrder = require("./colorOrder");

describe('PBColorOrder', function () {
  it('writes RGB colors correctly', function () {
    var order = new _colorOrder.PBColorOrder(0, 1, 2);
    var result = Buffer.alloc(3);
    order.writeColor(result, [0x01, 0x02, 0x03], 0);
    expect(result).toEqual(Buffer.from([0x01, 0x02, 0x03]));
  });
  it('writes BGR colors correctly', function () {
    var order = new _colorOrder.PBColorOrder(2, 1, 0);
    var result = Buffer.alloc(3);
    order.writeColor(result, [0x01, 0x02, 0x03], 0);
    expect(result).toEqual(Buffer.from([0x03, 0x02, 0x01]));
  });
});