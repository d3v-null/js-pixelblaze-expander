"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpanderDevice = exports.DEFAULT_OPTIONS = void 0;

var _messages = require("./messages");

var _colorOrder = require("./colorOrder");

var _serialport = _interopRequireDefault(require("serialport"));

var _deasync = _interopRequireDefault(require("deasync"));

var _fs = require("fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DEFAULT_OPTIONS = {
  baudRate: 2000000,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  channels: {
    0: {}
  },
  mock: false
};
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

var ExpanderDevice = /*#__PURE__*/function () {
  /**
   * Construct a PixelBlaxe Expander Device.
   *
   * @param {string} portName the name of the
   * [serial port](https://serialport.io/docs/api-stream#path) which the PBX board is connected
   * to (For example, `/dev/tty.XXX` on Mac/Linux, or `COM1` on Windows)
   * @param {DeviceOptions} options has the following structure:
   *
   * @typedef {Object} DeviceOptions
   * @see <https://serialport.io/docs/api-stream#openoptions> for details.
   * @param {Integer} [baudRate=2000000] you may wish to change to 2304000 if you're having
   * timing issues (e.g. Raspberry Pi Zero).
   * @param {Integer} [dataBits=8]
   * @param {Integer} [stopBits=1]
   * @param {string} [parity='none']
   * @param {Object<uint6,ChannelDef>} [channels={0:{}}] Definition of each channel that has
   * LEDs connected. Default is a single RGB WS281X device with maximum capacity on channel 0.
   * Object Keys are the channel number as labeled on the PBX PCB or jumper pad configuration.
   * Each board has 8 channels, and 8 boards can be chained, giving a maximum channel number of 64
   * (uint6). Object values are channel definitions, which have the following structure:
   *
   * @typedef {Object} ChannelDef
   * @param {string} [type='WS281X'] protocol used by PBX to talk to LEDs, only "WS281X" is
   * currently supported. "APA102_DATA" and "APA_CLOCK" to be implemented soon.
   * @param {string} [order=undefined] color order setting.
   * For APA102, use 4 colors, default is "RGBW".
   * For WS281X, use 3 or 4 colors, default is "RGB".
   * Only "RGB" or "RGBW" are currently supported, but it's pretty easy to add more by extending
   * `PBX_COLOR_ORDERS`.
   * @param {uint16} [capacity=undefined] number of pixels connected to this channel. By default
   * this is the maximum number of pixels that can be sent, for the channel, which depends on the
   * number of color channels specified in `order` (`N` where `N ∈ [3, 4]`) and the base size of
   * `type`. `baseSize` is 4 for WS2812 and 8 for APA102. So max capacity is defined by
   * `Math.floor(2048 - 6 - baseSize(type) - 4) / N)`
   */
  function ExpanderDevice(portName, options) {
    var _this = this;

    _classCallCheck(this, ExpanderDevice);

    var options = _objectSpread(_objectSpread({}, DEFAULT_OPTIONS), options);

    var _options = options,
        baudRate = _options.baudRate,
        dataBits = _options.dataBits,
        stopBits = _options.stopBits,
        parity = _options.parity,
        channels = _options.channels,
        mock = _options.mock;
    this.mock = mock;

    if (this.mock) {
      this.startTime = Date.now();
      this.port = (0, _fs.createWriteStream)(portName, {
        flags: 'w'
      });
    } else {
      this.port = new _serialport["default"](portName, {
        baudRate: baudRate,
        dataBits: dataBits,
        stopBits: stopBits,
        parity: parity
      });
      this.port.on('error', function (err) {
        if (err) {
          return console.error('Error on write: ', err.message);
        }
      });
      this.port.on('open', function (err) {
        if (err) {
          return console.log('Error opening port: ', err.message);
        }

        console.log('port opened', JSON.stringify(arguments));
      });
    }

    this.channelMessages = {};
    Object.entries(channels).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          channel = _ref2[0],
          _ref2$ = _ref2[1],
          order = _ref2$.order,
          type = _ref2$.type,
          capacity = _ref2$.capacity;

      // console.log(`channel: ${JSON.stringify({ channel, order, capacity, type })}`);
      var messageClass = (0, _messages.getMessageClass)(type);
      _this.channelMessages[channel] = new messageClass(channel, _colorOrder.PBX_COLOR_ORDERS[order], capacity);
    });
    this.drawAllMessage = new _messages.PBXDrawAllMessage();
  }

  _createClass(ExpanderDevice, [{
    key: "mockWrite",
    value: function mockWrite(bytes) {
      var magic = "SERT";
      var header = Buffer.alloc(magic.length + 8 + 4);
      var index = 0;
      index = header.write(magic);
      index = header.writeBigInt64LE(BigInt(Date.now() - this.startTime), index);
      header.writeInt32LE(bytes.length, index);
      this.port.write(header);
      this.port.write(bytes);
    }
  }, {
    key: "promiseSerialWrite",
    value: function promiseSerialWrite(bytes) {
      var _this2 = this;

      if (this.mock) {
        return this.mockWrite(bytes);
      }

      return new Promise(function (res, rej) {
        _this2.port.write(bytes, function (err) {
          if (err) {
            rej(err);
          }

          res(true);
        });
      });
    }
  }, {
    key: "promiseSerialDrain",
    value: function promiseSerialDrain() {
      var _this3 = this;

      return new Promise(function (res, rej) {
        _this3.port.drain(function (err) {
          if (err) {
            rej(err);
          }

          res(true);
        });
      });
    }
  }, {
    key: "promiseSerialWriteMaybeDrain",
    value: function promiseSerialWriteMaybeDrain(bytes) {
      if (this.mock) {
        return this.mockWrite(bytes);
      }

      return new Promise(function (res, rej) {
        var result = this.port.write(bytes, function (err) {
          if (err) {
            rej(err);
          }
        });

        if (!result) {
          this.promiseSerialDrain().then(function () {
            res(result);
          });
        } else {
          res(result);
        }
      }.bind(this));
    }
  }, {
    key: "blockUntilResolved",
    value: function blockUntilResolved(promise) {
      var done = false;
      promise.then(function () {
        done = true;
      });

      while (!done) {
        _deasync["default"].runLoopOnce();
      }
    }
    /**
     * Send colours to the PBX channel. Optionally draws all colours, or blocks until complete.
     *
     * @param {uint6} channel the channel, as marked on the PBX PCB or jumper pad configuration,
     * and has been defined in `options.channels`
     * @param {Array<ColourArray>} colors  an array containing a color array for each pixel on the
     * channel, where the number of pixels does not exceed `options.channels[channel].capacity`
     * @param {boolean} [drawAll=false] whether to send a drawAll command afterwards to refresh all
     * strips
     * @param {boolean} [blocking=false] whether to block until the call is complete
     *
     * @typedef {Array} ColourArray defines the value of each colour channel for a pixel
     * @param {uint8} red
     * @param {uint8} green
     * @param {uint8} blue
     * @param {uint8} [white] only required when `order` has 4 colours
     *
     * @returns {Promise} a promise to be resolved once the operation has finished
     */

  }, {
    key: "send",
    value: function send(channel, colors) {
      var drawAll = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var blocking = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (!Object.keys(this.channelMessages).includes(channel.toString())) {
        throw new Error("channel ".concat(channel, " is not defined, only ") + "".concat(JSON.stringify(Object.keys(this.channelMessages))));
      }

      var dataMessage = this.channelMessages[channel];
      dataMessage.setPixels(colors);
      var promise = Promise.all([this.promiseSerialWrite(dataMessage.toBytes()), drawAll ? this.drawAll() : Promise.resolve()]);
      if (blocking) this.blockUntilResolved(promise);
      return promise;
    }
    /**
     * Force the device to draw all channels.
     *
     * @param {boolean} [blocking=false] whether to block until the call is complete
     * @returns {Promise} a promise to be resolved once the operation has finished
     */

  }, {
    key: "drawAll",
    value: function drawAll() {
      var blocking = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var drawAllMessageBytes = this.drawAllMessage.toBytes();
      var promise = Promise.all([this.promiseSerialWriteMaybeDrain(drawAllMessageBytes), new Promise(function (res) {
        return setTimeout(res, 5);
      })]);
      if (blocking) this.blockUntilResolved(promise);
      return promise;
    }
  }]);

  return ExpanderDevice;
}();

exports.ExpanderDevice = ExpanderDevice;