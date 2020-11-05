"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMessageClass = getMessageClass;
exports.PBAPA102ClockMessage = exports.PBAPA102DataMessage = exports.PBXWS281XMessage = exports.PBXDataMessage = exports.PBXDrawAllMessage = exports.PBXMessage = exports.MESSAGE_CRC = void 0;

var _crc = require("./crc");

var _header = require("./header");

var _colorOrder = require("./colorOrder");

var _constants = require("./constants");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MESSAGE_CRC = new _crc.PBXCrc();
exports.MESSAGE_CRC = MESSAGE_CRC;

var PBXMessage = /*#__PURE__*/function () {
  _createClass(PBXMessage, null, [{
    key: "baseSize",
    value: function baseSize(type) {
      switch (type) {
        case _constants.PBX_RECORD_TYPES.SET_CHANNEL_WS2812:
        case _constants.PBX_RECORD_TYPES.SET_CHANNEL_APA102_CLOCK:
          return 4;

        case _constants.PBX_RECORD_TYPES.SET_CHANNEL_APA102_DATA:
          return 8;

        case _constants.PBX_RECORD_TYPES.DRAW_ALL:
        default:
          return 0;
      }
    }
  }, {
    key: "totalSize",
    value: function totalSize(bodySize) {
      return _header.HEADER_SIZE + bodySize + _crc.CRC_SIZE;
    }
  }, {
    key: "capacityOrDefault",
    value: function capacityOrDefault(type, order, capacity) {
      if (typeof capacity !== 'undefined') {
        return capacity;
      }

      return Math.floor((_constants.MAX_CHANNEL_BYTES - this.totalSize(this.baseSize(type))) / order.length);
    }
  }, {
    key: "orderOrDefault",
    value: function orderOrDefault(type, order) {
      if (typeof order !== 'undefined') {
        return order;
      }

      switch (type) {
        case _constants.PBX_RECORD_TYPES.SET_CHANNEL_APA102_DATA:
          return _colorOrder.PBX_COLOR_ORDERS.RGBW;

        default:
          return _colorOrder.PBX_COLOR_ORDERS.RGB;
      }
    }
  }, {
    key: "pixelSize",
    value: function pixelSize(type, order, capacity) {
      switch (type) {
        case _constants.PBX_RECORD_TYPES.SET_CHANNEL_APA102_DATA:
        case _constants.PBX_RECORD_TYPES.SET_CHANNEL_WS2812:
          return order.length * capacity;

        default:
          return 0;
      }
    }
  }]);

  function PBXMessage(bodySize, channel, type) {
    _classCallCheck(this, PBXMessage);

    if (bodySize < 0) {
      throw new Error("Body size (".concat(size, ") is less than zero"));
    }

    this.size = PBXMessage.totalSize(bodySize);

    if (this.size > _constants.MAX_CHANNEL_BYTES) {
      throw new Error("Total size, ".concat(this.size, " = header size (").concat(_header.HEADER_SIZE, ") + body size (").concat(bodySize, ")") + " + crc size (".concat(_crc.CRC_SIZE, "), is larger than maximum size: ").concat(_constants.MAX_CHANNEL_BYTES));
    }

    this.buffer = Buffer.alloc(this.size);
    this.header = new _header.PBXHeader(channel, type);
    this.writeHeader();
  }

  _createClass(PBXMessage, [{
    key: "writeHeader",
    value: function writeHeader() {
      this.header.writeBytes(this.buffer);
    }
  }, {
    key: "updateCrc",
    value: function updateCrc() {
      MESSAGE_CRC.reset();
      MESSAGE_CRC.updateBytes(this.buffer, 0, this.size - _crc.CRC_SIZE);
    }
  }, {
    key: "writeCrc",
    value: function writeCrc() {
      MESSAGE_CRC.writeInvSum(this.buffer, this.size - _crc.CRC_SIZE);
    }
  }, {
    key: "toBytes",
    value: function toBytes() {
      this.updateCrc(MESSAGE_CRC);
      this.writeCrc(MESSAGE_CRC);
      return this.buffer;
    }
  }]);

  return PBXMessage;
}();

exports.PBXMessage = PBXMessage;

var PBXDrawAllMessage = /*#__PURE__*/function (_PBXMessage) {
  _inherits(PBXDrawAllMessage, _PBXMessage);

  var _super = _createSuper(PBXDrawAllMessage);

  function PBXDrawAllMessage() {
    _classCallCheck(this, PBXDrawAllMessage);

    return _super.call(this, 0, 0, _constants.PBX_RECORD_TYPES.DRAW_ALL);
  }

  return PBXDrawAllMessage;
}(PBXMessage);

exports.PBXDrawAllMessage = PBXDrawAllMessage;

var PBXDataMessage = /*#__PURE__*/function (_PBXMessage2) {
  _inherits(PBXDataMessage, _PBXMessage2);

  var _super2 = _createSuper(PBXDataMessage);

  function PBXDataMessage(channel, type, order, capacity) {
    var _this;

    _classCallCheck(this, PBXDataMessage);

    var order = PBXMessage.orderOrDefault(type, order);
    var capacity = PBXMessage.capacityOrDefault(type, order, capacity);
    var baseSize = PBXMessage.baseSize(type);
    var pixelSize = PBXMessage.pixelSize(type, order, capacity);
    _this = _super2.call(this, baseSize + pixelSize, channel, type);
    _this.order = order;
    _this.capacity = capacity;
    _this.baseSize = baseSize;
    _this.pixelSize = pixelSize;

    _this.writeBase();

    return _this;
  }

  _createClass(PBXDataMessage, [{
    key: "writeBase",
    value: function writeBase() {
      var offset = _header.HEADER_SIZE;
      offset = this.buffer.writeUInt8(this.order.length, offset);
      offset = this.buffer.writeUInt8(this.order.union, offset);
      var result = this.buffer.writeUInt16LE(this.capacity, offset);
      return result;
    }
  }, {
    key: "setPixels",
    value: function setPixels(pixels) {
      var _this2 = this;

      if (pixels.length > this.capacity) {
        throw new Error("pixel count (".concat(pixels.length, ") > capacity (").concat(this.capacity, ")"));
      }

      var offset = _header.HEADER_SIZE + this.baseSize;
      pixels.forEach(function (color) {
        offset = _this2.order.writeColor(_this2.buffer, color, offset);
      });
    }
  }]);

  return PBXDataMessage;
}(PBXMessage);

exports.PBXDataMessage = PBXDataMessage;

var PBXWS281XMessage = /*#__PURE__*/function (_PBXDataMessage) {
  _inherits(PBXWS281XMessage, _PBXDataMessage);

  var _super3 = _createSuper(PBXWS281XMessage);

  function PBXWS281XMessage(channel, order, capacity) {
    _classCallCheck(this, PBXWS281XMessage);

    return _super3.call(this, channel, _constants.PBX_RECORD_TYPES.SET_CHANNEL_WS2812, order, capacity);
  }

  return PBXWS281XMessage;
}(PBXDataMessage);

exports.PBXWS281XMessage = PBXWS281XMessage;

var PBAPA102DataMessage = /*#__PURE__*/function (_PBXDataMessage2) {
  _inherits(PBAPA102DataMessage, _PBXDataMessage2);

  var _super4 = _createSuper(PBAPA102DataMessage);

  function PBAPA102DataMessage() {
    _classCallCheck(this, PBAPA102DataMessage);

    return _super4.apply(this, arguments);
  }

  return PBAPA102DataMessage;
}(PBXDataMessage);

exports.PBAPA102DataMessage = PBAPA102DataMessage;

var PBAPA102ClockMessage = /*#__PURE__*/function (_PBXMessage3) {
  _inherits(PBAPA102ClockMessage, _PBXMessage3);

  var _super5 = _createSuper(PBAPA102ClockMessage);

  function PBAPA102ClockMessage() {
    _classCallCheck(this, PBAPA102ClockMessage);

    return _super5.apply(this, arguments);
  }

  return PBAPA102ClockMessage;
}(PBXMessage);

exports.PBAPA102ClockMessage = PBAPA102ClockMessage;

function getMessageClass(type) {
  switch (type) {
    case 'APA102_DATA':
    case 'SK9822_DATA':
      return PBAPA102DataMessage;

    case 'APA102_CLOCK':
    case 'SK9822_CLOCK':
      return PBAPA102ClockMessage;

    case 'WS281X':
    case 'WS2811':
    case 'WS2812':
    default:
      return PBXWS281XMessage;
  }
}