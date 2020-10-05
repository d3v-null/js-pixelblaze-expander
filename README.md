# PixelBlaze Output Expander Serial Library

A NodeJS Library for controlling
[PixelBlaze Expander](https://github.com/simap/pixelblaze_output_expander) A.K.A.
[ElectroMage Serial to 8x WS2812/APA102 Driver](https://www.tindie.com/products/electromage/electromage-serial-to-8x-ws2812apa102-driver/)
boards via serial port.

![Node.js Build Status](https://github.com/derwentx/js-pixelblaze-expander/workflows/Node.js%20Lint%20and%20Coverage/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/b16f8ee13c50462afb9a/maintainability)](https://codeclimate.com/github/derwentx/js-pixelblaze-expander/maintainability)
[![codecov](https://codecov.io/gh/derwentx/js-pixelblaze-expander/branch/master/graph/badge.svg?token=U2FEMWJX04)](undefined)
[![Known Vulnerabilities](https://snyk.io/test/github/derwentx/js-pixelblaze-expander/badge.svg?targetFile=package.json)](https://snyk.io/test/github/derwentx/js-pixelblaze-expander?targetFile=package.json)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/derwentx/js-pixelblaze-expander.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/derwentx/js-pixelblaze-expander/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/derwentx/js-pixelblaze-expander.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/derwentx/js-pixelblaze-expander/alerts/)

## Installation

```bash
npm install pixelblaze-expander --save
```

## Usage

Create a PBX `device` with

```javascript
var device = new ExpanderDevice(portName, options);
```

documentation for `ExpanderDevice.constructor`

```javascript
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
```

send colors to channels a and b, then draw the pixels with:

```javascript
device.send(channel_a, colors_a, drawAll, blocking);
device.send(channel_b, colors_a, drawAll, blocking);
device.drawAll();
```

documentation for `ExpanderDevice.send`

```javascript
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
```

documentation for `ExpanderDevice.drawAll`

```javascript
/**
 * Force the device to draw all channels.
 *
 * @param {boolean} [blocking=false] whether to block until the call is complete
 * @returns {Promise} a promise to be resolved once the operation has finished
 */
```

## Examples

See [examples](examples) for more info. You can run each example with:

```bash
npx babel-node examples/ws281xAsync.js    # Send colours asynchronously
npx babel-node examples/ws281xBlocking.js # Block until each colour is sent
```
