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

where:

- `portName` is the name of the [serial port](https://serialport.io/docs/api-stream#path) which the
  PBX board is connected to (For example, `/dev/tty.XXX` on Mac/Linux, or `COM1` on Windows), and
- `options` has the following structure:

```javascript
var options = {
  /**
   * (Integer) baud rate. Default for PBX is 2000000, but you may wish to change to 2304000 on a
   * raspberry pi zero, if you're having timing issues. See
   * <https://serialport.io/docs/api-stream#openoptions> for details.
   */
  baudRate,
  /**
   * (Integer) data bits. Default for PBX is 8, See
   * <https://serialport.io/docs/api-stream#openoptions> for more info.
   */
  dataBits,
  /**
   * (Integer) stop bits. Default for PBX is 1, See
   * <https://serialport.io/docs/api-stream#openoptions> for more info.
   */
  stopBits,
  /**
   * (String) parity settings. Default for PBX is 'none', See
   * <https://serialport.io/docs/api-stream#openoptions> for more info.
   */
  parity,
  /**
   * (Object<Integer, Object>) Definition of each channel that has LEDs connected.
   * Default is a single RGB WS281X device with maximum capacity on channel 0.
   */
  channels: [
    /**
     * (Integer) channel number as labeled on the PBX PCB.
     */
    0: {
      /*
       * (String) protocol used by PBX to talk to LEDs, only "WS281X" is currently supported.
       * "APA102_DATA" and "APA_CLOCK" to be implemented soon.
       */
      type,
      /**
       * (String) color order setting. For APA102, use 4 colours, default is "RGBW". For WS281X,
       * use 3 or 4 colours, default is "RGB".  Only "RGB" or "RGBW" are currently supported, but
       * it's pretty easy to add more by extending `PBX_COLOR_ORDERS`.
       */
      order,
      /**
       * (Integer) number of pixels connected to this channel. By default this is the maximum
       * number of pixels that can be sent, for the channel, which depends on the number of
       * colour channels specified in `order` (`N` where `N ∈ [3, 4]`) and the base size of
       * `type`. `baseSize` is 4 for WS2812 and 8 for APA102.
       * `Capacity = ⌊(2048 - 6 - baseSize(type) - 4) / N⌋`
       */
      capacity
    }
  ]
}
```

## Examples

See [examples](examples) for more info. You can run the ws281x example with

```bash
npx babel-node examples/ws281x.js
```
