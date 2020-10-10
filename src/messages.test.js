import { CRC_SIZE } from "./crc";
import { HEADER_SIZE } from "./header";
import { PBX_COLOR_ORDERS } from "./colorOrder";
import { PBX_RECORD_TYPES } from "./constants";
import { PBXDrawAllMessage, PBXWS281XMessage, PBXMessage, MESSAGE_CRC } from "./messages";

describe('PBXMessage', () => {
    it('writes basic drawall header with writeHeader', () => {
        const message = new PBXMessage(0, 0, PBX_RECORD_TYPES.DRAW_ALL);
        expect(message.buffer).toEqual(Buffer.from([
            0x55, 0x50, 0x58, 0x4c, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00
        ]));
    });

    it('updates CRC for basic drawall header with updateCrc', () => {
        const message = new PBXMessage(0, 0, PBX_RECORD_TYPES.DRAW_ALL);
        message.updateCrc();
        expect(MESSAGE_CRC.sum >>> 0).toEqual(3009034774 >>> 0);
    });

    it('writes CRC for basic drawall message with writeCrc', () => {
        const message = new PBXMessage(0, 0, PBX_RECORD_TYPES.DRAW_ALL);
        MESSAGE_CRC.sum = 3009034774 >>> 0;
        message.writeCrc();
        expect(message.buffer.slice(message.size - CRC_SIZE, message.size)).toEqual(Buffer.from([
            0xe9, 0xc5, 0xa5, 0x4c
        ]));
    });
});
describe('PBXDrawAllMessage', () => {
    it('serializes a basic draw all message', () => {
        const message = new PBXDrawAllMessage();
        expect(message.toBytes()).toEqual(Buffer.from([
            0x55, 0x50, 0x58, 0x4c, 0x00, 0x02, 0xe9, 0xc5, 0xa5, 0x4c
        ]));
    });
});
describe('PBXWS281XMessage', () => {
    it('writes base correctly', () => {
        const message = new PBXWS281XMessage(1, PBX_COLOR_ORDERS.RGB, 1);
        message.writeBase();
        expect(message.buffer.slice(HEADER_SIZE, HEADER_SIZE + 4)).toEqual(Buffer.from([
            0x03, 0x24, 0x01, 0x00
        ]));

    });
    it('serializes a basic WS281X message with single red', () => {
        const message = new PBXWS281XMessage(0, PBX_COLOR_ORDERS.RGB, 1);
        message.setPixels([[0xff, 0x00, 0x00]]);
        expect(message.toBytes()).toEqual(Buffer.from([
            0x55, 0x50, 0x58, 0x4c, 0x00, 0x01, 0x03, 0x24, 0x01, 0x00, 0xff, 0x00, 0x00, 0xdd,
            0x03, 0xd6, 0x83
        ]));
    });
});
