const {ExpanderDevice} = require('../src/index.js');
import { hsl2Rgb } from 'colorsys';

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
    process.exit(1) //mandatory (as per the Node docs)
})

class WS281XExample {

    constructor() {
        this.options = {
            channelDefs: [
                {channel: 0, capacity: 300},
                {channel: 1, capacity: 300},
                {channel: 2, capacity: 300},
                {channel: 3, capacity: 300},
                {channel: 4, capacity: 300},
                {channel: 5, capacity: 300}
            ]
        }
        this.device = new ExpanderDevice('/dev/tty.usbserial-AD025M69', this.options);
        this.loopCount = 0;
    }

    loop() {
        this.loopCount += 1;
        this.options.channelDefs.forEach(({channel, capacity}) => {
            const colors = Array(capacity).fill().map((_, idx) => {
                const {r, g, b} = hsl2Rgb(idx * 5 + this.loopCount, 100, 10);
                return [r, g, b];
            });
            this.device.send(channel, colors, false);
        })
        this.device.drawAll();
    }

    run() {
        setInterval(this.loop.bind(this) , 30);
    }
};

(new WS281XExample()).run();
