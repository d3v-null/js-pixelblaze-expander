"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PBXHeader = exports.HEADER_SIZE = void 0;

var _constants = require("./constants");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HEADER_SIZE = 6;
exports.HEADER_SIZE = HEADER_SIZE;

var PBXHeader = /*#__PURE__*/function () {
  function PBXHeader(channel, recordType) {
    _classCallCheck(this, PBXHeader);

    if (channel >= _constants.CHANNEL_MAX) {
      throw new Error("Channel ".concat(channel, " larger than channel maximum, ").concat(_constants.CHANNEL_MAX));
    } else if (channel < 0) {
      throw new Error("Channel ".concat(channel, " can't be less than zero"));
    }

    this.channel = channel;

    if (!Object.values(_constants.PBX_RECORD_TYPES).includes(recordType)) {
      throw new Error("Record type ".concat(recordType, " is not one of ").concat(JSON.stringify(_constants.PBX_RECORD_TYPES)));
    }

    this.recordType = recordType;
    this.magic = "UPXL";
  }

  _createClass(PBXHeader, [{
    key: "writeBytes",
    value: function writeBytes(buffer) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      offset = buffer.write(this.magic, offset);
      offset = buffer.writeUInt8(this.channel, offset);
      buffer.writeUInt8(this.recordType, offset);
    }
  }, {
    key: "toBytes",
    value: function toBytes() {
      var result = Buffer.alloc(HEADER_SIZE, 0);
      this.writeBytes(result);
      return result;
    }
  }]);

  return PBXHeader;
}();

exports.PBXHeader = PBXHeader;