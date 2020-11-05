"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PBX_COLOR_ORDERS = exports.PBColorOrder = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PBColorOrder = /*#__PURE__*/function () {
  function PBColorOrder() {
    var _this = this;

    _classCallCheck(this, PBColorOrder);

    for (var _len = arguments.length, locations = new Array(_len), _key = 0; _key < _len; _key++) {
      locations[_key] = arguments[_key];
    }

    this.length = locations.length;

    if (this.length < 3 || this.length > 4) {
      throw new Error("Color order (".concat(JSON.stringify(locations), ") should be 3 or 4 numbers."));
    }

    this.locations = locations;
    this.union = 0;
    this.locations.forEach(function (location, idx) {
      _this.union = _this.union | (location & 3) << idx * 2;
    });
  }

  _createClass(PBColorOrder, [{
    key: "writeColor",
    value: function writeColor(buffer, color, offset) {
      if (color.length !== this.length) {
        throw new Error("color (".concat(JSON.stringify(color), ") has the wrong length, expected ").concat(this.length));
      }

      this.locations.forEach(function (location, idx) {
        if (location < 0) return;
        buffer.writeUInt8(color[idx], offset + location);
      });
      return offset + this.length;
    }
  }]);

  return PBColorOrder;
}();

exports.PBColorOrder = PBColorOrder;
var PBX_COLOR_ORDERS = {
  RGBW: new PBColorOrder(0, 1, 2, 3),
  RGBV: new PBColorOrder(0, 1, 2, -1),
  RGB: new PBColorOrder(0, 1, 2)
};
exports.PBX_COLOR_ORDERS = PBX_COLOR_ORDERS;