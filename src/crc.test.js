import { PBXCrc, CRC_SIZE } from "./crc";

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
        const result = Buffer.alloc(CRC_SIZE);
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
