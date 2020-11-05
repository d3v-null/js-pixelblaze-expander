import { getMessageClass, PBXDrawAllMessage } from './messages';
import { PBX_COLOR_ORDERS } from './colorOrder';
import SerialPort from 'serialport';
import node from 'deasync';
import { createWriteStream } from 'fs';

export const DEFAULT_OPTIONS = {
    baudRate: 2000000,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    channels: {
        0: {}
    },
    mock: false
};

export class ExpanderDevice {
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
    constructor(portName, options) {
        var options = { ...DEFAULT_OPTIONS, ...options };
        var { baudRate, dataBits, stopBits, parity, channels, mock } = options;

        this.mock = mock;

        if(this.mock) {
            this.startTime = Date.now();
            this.port = createWriteStream(portName, {flags: 'w'});
        } else {
            this.port = new SerialPort(portName, { baudRate, dataBits, stopBits, parity });
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
        Object.entries(channels).forEach(([channel, { order, type, capacity }]) => {
            // console.log(`channel: ${JSON.stringify({ channel, order, capacity, type })}`);
            const messageClass = getMessageClass(type);
            this.channelMessages[channel] = new messageClass(channel, PBX_COLOR_ORDERS[order], capacity);
        });
        this.drawAllMessage = new PBXDrawAllMessage();
    }

    mockWrite(bytes) {
        const magic = "SERT"
        const header = Buffer.alloc(magic.length + 8 + 4);
        var index = 0;
        index = header.write(magic);
        index = header.writeBigInt64LE(BigInt(Date.now() - this.startTime), index);
        header.writeInt32LE(bytes.length, index);
        this.port.write(header);
        this.port.write(bytes);
    }

    promiseSerialWrite(bytes) {
        if(this.mock) {
            return this.mockWrite(bytes);
        }
        return new Promise((res, rej) => {
            this.port.write(bytes, function (err) {
                if (err) {
                    rej(err);
                }
                res(true);
            });
        });
    }

    promiseSerialDrain() {
        return new Promise((res, rej) => {
            this.port.drain(function (err) {
                if (err) {
                    rej(err);
                }
                res(true);
            });
        });
    }

    promiseSerialWriteMaybeDrain(bytes) {
        if(this.mock) {
            return this.mockWrite(bytes);
        }
        return new Promise((function (res, rej) {
            const result = this.port.write(bytes, function (err) {
                if (err) {
                    rej(err);
                }
            });
            if (!result) {
                this.promiseSerialDrain().then(() => {
                    res(result);
                });
            } else {
                res(result);
            }
        }).bind(this));
    }

    blockUntilResolved(promise) {
        let done = false;
        promise.then(() => { done = true; });
        while (!done)
            node.runLoopOnce();
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
    send(channel, colors, drawAll = true, blocking = false) {
        if (!Object.keys(this.channelMessages).includes(channel.toString())) {
            throw new Error(
                `channel ${channel} is not defined, only `
                + `${JSON.stringify(Object.keys(this.channelMessages))}`);
        }
        const dataMessage = this.channelMessages[channel];
        dataMessage.setPixels(colors);
        const promise = Promise.all([
            this.promiseSerialWrite(dataMessage.toBytes()),
            drawAll ? this.drawAll() : Promise.resolve()
        ]);
        if(blocking) this.blockUntilResolved(promise);
        return promise;
    }

    /**
     * Force the device to draw all channels.
     *
     * @param {boolean} [blocking=false] whether to block until the call is complete
     * @returns {Promise} a promise to be resolved once the operation has finished
     */
    drawAll(blocking = false) {
        const drawAllMessageBytes = this.drawAllMessage.toBytes();
        const promise = Promise.all([
            this.promiseSerialWriteMaybeDrain(drawAllMessageBytes),
            new Promise(res => setTimeout(res, 5))
        ]);
        if(blocking) this.blockUntilResolved(promise);
        return promise;
    }
}
