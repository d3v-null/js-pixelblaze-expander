"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PBX_RECORD_TYPES = exports.MAX_CHANNEL_BYTES = exports.CHANNEL_MAX = void 0;
var CHANNEL_MAX = 64;
exports.CHANNEL_MAX = CHANNEL_MAX;
var MAX_CHANNEL_BYTES = 2048;
exports.MAX_CHANNEL_BYTES = MAX_CHANNEL_BYTES;
var PBX_RECORD_TYPES = {
  SET_CHANNEL_WS2812: 1,
  DRAW_ALL: 2,
  SET_CHANNEL_APA102_DATA: 3,
  SET_CHANNEL_APA102_CLOCK: 4
};
exports.PBX_RECORD_TYPES = PBX_RECORD_TYPES;