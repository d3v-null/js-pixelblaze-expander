const { ExpanderDevice } = require('../src/index.js');
import { hsl2Rgb } from 'colorsys';

/**
 * PixelBlaze Output Expander WS281X Example
 *
 * You can run this file with:
 *
 * ```bash
 * npx babel-node examples/ws281x.js
 * ```
 */

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
    process.exit(1) //mandatory (as per the Node docs)
})

class WS281XExample {

    constructor() {
        this.options = {
            channels: {
                0: { capacity: 300 },
                1: { capacity: 300 },
                2: { capacity: 300 },
                3: { capacity: 300 },
                4: { capacity: 300 },
                5: { capacity: 300 }
            }
        }
        this.device = new ExpanderDevice('/dev/tty.usbserial-AD025M69', this.options);
        this.loopCount = 0;
        this.startTime = Date.now();
    }

    async loop() {
        this.loopCount += 1;
        const loopStartTime = Date.now();
        const promises = Object.entries(this.options.channels).map(async ([channel, { capacity }]) => {
            const colors = Array(capacity).fill().map((_, idx) => {
                const { r, g, b } = hsl2Rgb((idx * 3) + (this.loopCount * 5), 100, 10);
                return [r, g, b];
            });
            return this.device.send(channel, colors, false);
        })
        promises.push(this.device.drawAll());
        return Promise.all(promises).then(() => {
            const frameRate = parseInt(1000 * this.loopCount / (Date.now() - this.startTime))
                .toString(10).padStart(10, ' ');
            const frameTime = Date.now() - loopStartTime;
            process.stdout.write(`frameRate: ${frameRate}, last: ${frameTime}ms\r`);
        });
    }

    async loopForever() {
        this.loop().then(() => {
            setTimeout(this.loopForever.bind(this), 1);
        });
    }

    run() {
        this.loopForever();
    }
};

(new WS281XExample()).run();
