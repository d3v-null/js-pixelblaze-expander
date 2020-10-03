import { PBColorOrder, PBXHeader, PBXDrawAllMessage, PBXWS281XMessage, PBX_RECORD_TYPES, PBX_COLOR_ORDERS, PBXCrc, PBXMessage } from './index'

describe('PBXHeader', () => {
    it('serializes basic headers', () => {
        const basicHeader = new PBXHeader(10, PBX_RECORD_TYPES.SET_CHANNEL_APA102_DATA);
        const basicHeaderBytes = basicHeader.toBytes();
        expect(basicHeaderBytes.length).toBe(PBXHeader.size);
        expect(basicHeaderBytes).toEqual(Buffer.from([0x55, 0x50, 0x58, 0x4c, 0x0a, 0x03]));
    })

    it('handles invalid channels', () => {
        expect(() => { new PBXHeader(-1, PBX_RECORD_TYPES.DRAW_ALL); }).toThrow(Error);
        expect(() => { new PBXHeader(64, PBX_RECORD_TYPES.DRAW_ALL); }).toThrow(Error);
    })
});

describe('PBColorOrder', () => {
    it('writes RGB colors correctly', () => {
        const order = new PBColorOrder(0, 1, 2)
        const result = Buffer.alloc(3);
        order.writeColor(result, [0x01, 0x02, 0x03], 0);
        expect(result).toEqual(Buffer.from([0x01, 0x02, 0x03]))
    });
    it('writes BGR colors correctly', () => {
        const order = new PBColorOrder(2, 1, 0)
        const result = Buffer.alloc(3);
        order.writeColor(result, [0x01, 0x02, 0x03], 0);
        expect(result).toEqual(Buffer.from([0x03, 0x02, 0x01]))
    });
});

describe('PBXCrc', () => {
    it('matches updateBytes Java implementation', () => {
        const crc = new PBXCrc();
        crc.updateBytes([
            0x55, 0x50, 0x58, 0x4c, 0x00, 0x01, 0x03, 0x24, 0x01, 0x00, 0xff, 0x00, 0x00, 0xdd,
            0x03, 0xd6, 0x83
        ], 0, 13);
        expect(crc.sum).toBe(2083126306);
    });

    it('handles nonzero start values in updateBytes', () => {
        const crc = new PBXCrc();
        crc.updateBytes([
            0x69, 0x55, 0x50, 0x58, 0x4c, 0x00, 0x01, 0x03, 0x24, 0x01, 0x00, 0xff, 0x00, 0x00, 0xdd,
            0x03, 0xd6, 0x83
        ], 1, 14);
        expect(crc.sum).toBe(2083126306);
    });

    it('matches writeInvSum Java implementation', () => {
        const crc = new PBXCrc();
        crc.updateBytes([
            0x55, 0x50, 0x58, 0x4c, 0x00, 0x02
        ]);
        const result = Buffer.alloc(PBXCrc.size);
        crc.writeInvSum(result, 0);
        expect(result).toEqual(Buffer.from([
            0xe9, 0xc5, 0xa5, 0x4c
        ]));
    });

    it('matches toBytes Java implementation', () => {
        const crc = new PBXCrc();
        crc.updateBytes([
            0x55, 0x50, 0x58, 0x4c, 0x00, 0x02
        ]);
        expect(crc.toBytes()).toEqual(Buffer.from([
            0xe9, 0xc5, 0xa5, 0x4c
        ]));
    });
});

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
        expect(PBXMessage.crc.sum >>> 0).toEqual(3009034774 >>> 0);
    });

    it('writes CRC for basic drawall message with writeCrc', () => {
        const message = new PBXMessage(0, 0, PBX_RECORD_TYPES.DRAW_ALL);
        PBXMessage.crc.sum = 3009034774 >>> 0;
        message.writeCrc();
        expect(message.buffer.slice(message.size - PBXCrc.size, message.size)).toEqual(Buffer.from([
            0xe9, 0xc5, 0xa5, 0x4c
        ]));
    });
});

describe('PBXDrawAllMessage', () => {
    it('serializes a basic draw all message', () => {
        const message = new PBXDrawAllMessage();
        expect(message.toBytes()).toEqual(Buffer.from([
            0x55, 0x50, 0x58, 0x4c, 0x00, 0x02, 0xe9, 0xc5, 0xa5, 0x4c
        ]))
    })
});

describe('PBXWS281XMessage', () => {
    it('writes base correctly', () => {
        const message = new PBXWS281XMessage(1, PBX_COLOR_ORDERS.RGB, 1);
        message.writeBase();
        expect(message.buffer.slice(PBXHeader.size, PBXHeader.size + 4)).toEqual(Buffer.from([
            0x03, 0x24, 0x01, 0x00
        ]))

    });
    it('serializes a basic WS281X message with single red', () => {
        const message = new PBXWS281XMessage(0, PBX_COLOR_ORDERS.RGB, 1);
        message.setPixels([[0xff, 0x00, 0x00]]);
        expect(message.toBytes()).toEqual(Buffer.from([
            0x55, 0x50, 0x58, 0x4c, 0x00, 0x01, 0x03, 0x24, 0x01, 0x00, 0xff, 0x00, 0x00, 0xdd,
            0x03, 0xd6, 0x83
        ]))
    })
})
