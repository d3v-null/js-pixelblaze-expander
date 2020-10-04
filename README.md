# PixelBlaze Output Expander Serial Library

A NodeJS Library for controlling
[PixelBlaze Expander](https://github.com/simap/pixelblaze_output_expander) A.K.A.
[ElectroMage Serial to 8x WS2812/APA102 Driver](https://www.tindie.com/products/electromage/electromage-serial-to-8x-ws2812apa102-driver/)
boards via serial port.

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
  PBX board is connected to (For example, /dev/tty.XXX on Mac/Linux, or COM1 on Windows), and
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
  dataBits
  /**
   * (Integer) stop bits. Default for PBX is 1, See
   * <https://serialport.io/docs/api-stream#openoptions> for more info.
   */
  stopBits
  /**
   * (String) parity settings. Default for PBX is 'none', See
   * <https://serialport.io/docs/api-stream#openoptions> for more info.
   */
  parity
  channelDefs: [ /* (Array<Object>) Definition of each channel that has LEDs connected */
    {
      /**
       * (Integer) channel number as labeled on the PBX PCB.
       */
      channel
      /**
       * (String) color order setting. Default for APA102 is "RGBW", default for  Only "RGB" or
       * "RGBW" are currently supported, but it's pretty easy to add more by extending
       * `PBX_COLOR_ORDERS`.
       */
      order
      /*
       * (String) protocol used by PBX to talk to LEDs, only "WS281X" is currently supported.
       * "APA102_DATA" and "APA_CLOCK" to be implemented soon.
       */
      type
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
````
