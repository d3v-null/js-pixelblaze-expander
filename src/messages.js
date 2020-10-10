import { PBXCrc, CRC_SIZE } from "./crc";
import { PBXHeader, HEADER_SIZE } from "./header";
import { PBX_COLOR_ORDERS } from "./colorOrder";
import { PBX_RECORD_TYPES, MAX_CHANNEL_BYTES } from "./constants";

export const MESSAGE_CRC = new PBXCrc();

export class PBXMessage {

    static baseSize(type) {
        switch (type) {
            case PBX_RECORD_TYPES.SET_CHANNEL_WS2812:
            case PBX_RECORD_TYPES.SET_CHANNEL_APA102_CLOCK: return 4;
            case PBX_RECORD_TYPES.SET_CHANNEL_APA102_DATA: return 8;
            case PBX_RECORD_TYPES.DRAW_ALL:
            default: return 0;
        }
    }

    static totalSize(bodySize) {
        return HEADER_SIZE + bodySize + CRC_SIZE;
    }

    static capacityOrDefault(type, order, capacity) {
        if (typeof capacity !== 'undefined') {
            return capacity;
        }
        return Math.floor((MAX_CHANNEL_BYTES - this.totalSize(this.baseSize(type))) / order.length);
    }

    static orderOrDefault(type, order) {
        if (typeof order !== 'undefined') {
            return order;
        }
        switch (type) {
            case PBX_RECORD_TYPES.SET_CHANNEL_APA102_DATA:
                return PBX_COLOR_ORDERS.RGBW;
            default:
                return PBX_COLOR_ORDERS.RGB;
        }
    }

    static pixelSize(type, order, capacity) {
        switch (type) {
            case PBX_RECORD_TYPES.SET_CHANNEL_APA102_DATA:
            case PBX_RECORD_TYPES.SET_CHANNEL_WS2812:
                return order.length * capacity;
            default:
                return 0;
        }
    }

    constructor(bodySize, channel, type) {
        if (bodySize < 0) {
            throw new Error(`Body size (${size}) is less than zero`);
        }
        this.size = PBXMessage.totalSize(bodySize);
        if (this.size > MAX_CHANNEL_BYTES) {
            throw new Error(
                `Total size, ${this.size} = header size (${HEADER_SIZE}) + body size (${bodySize})`
                + ` + crc size (${CRC_SIZE}), is larger than maximum size: ${MAX_CHANNEL_BYTES}`);
        }
        this.buffer = Buffer.alloc(this.size);
        this.header = new PBXHeader(channel, type);
        this.writeHeader();
    }

    writeHeader() {
        this.header.writeBytes(this.buffer);
    }

    updateCrc() {
        MESSAGE_CRC.reset();
        MESSAGE_CRC.updateBytes(this.buffer, 0, this.size - CRC_SIZE);
    }

    writeCrc() {
        MESSAGE_CRC.writeInvSum(this.buffer, this.size - CRC_SIZE);
    }

    toBytes() {
        this.updateCrc(MESSAGE_CRC);
        this.writeCrc(MESSAGE_CRC);
        return this.buffer;
    }
}

export class PBXDrawAllMessage extends PBXMessage {
    constructor() {
        super(0, 0, PBX_RECORD_TYPES.DRAW_ALL);
    }
}

export class PBXDataMessage extends PBXMessage {
    constructor(channel, type, order, capacity) {
        var order = PBXMessage.orderOrDefault(type, order);
        var capacity = PBXMessage.capacityOrDefault(type, order, capacity);
        var baseSize = PBXMessage.baseSize(type);
        var pixelSize = PBXMessage.pixelSize(type, order, capacity);
        super(baseSize + pixelSize, channel, type);
        this.order = order;
        this.capacity = capacity;
        this.baseSize = baseSize;
        this.pixelSize = pixelSize;
        this.writeBase();
    }

    writeBase() {
        var offset = HEADER_SIZE;
        offset = this.buffer.writeUInt8(this.order.length, offset);
        offset = this.buffer.writeUInt8(this.order.union, offset);
        const result = this.buffer.writeUInt16LE(this.capacity, offset);
        return result;
    }

    setPixels(pixels) {
        if (pixels.length > this.capacity) {
            throw new Error(`pixel count (${pixels.length}) > capacity (${this.capacity})`);
        }
        var offset = HEADER_SIZE + this.baseSize;
        pixels.forEach((color) => {
            offset = this.order.writeColor(this.buffer, color, offset);
        });
    }
}

export class PBXWS281XMessage extends PBXDataMessage {
    constructor(channel, order, capacity) {
        super(channel, PBX_RECORD_TYPES.SET_CHANNEL_WS2812, order, capacity);
    }
}

export class PBAPA102DataMessage extends PBXDataMessage {
}

export class PBAPA102ClockMessage extends PBXMessage {
}

export function getMessageClass(type) {
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
