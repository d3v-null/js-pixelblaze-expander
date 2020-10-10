import { PBXHeader, HEADER_SIZE } from "./header";
import { PBX_RECORD_TYPES } from "./constants";

describe('PBXHeader', () => {
    it('serializes basic headers', () => {
        const basicHeader = new PBXHeader(10, PBX_RECORD_TYPES.SET_CHANNEL_APA102_DATA);
        const basicHeaderBytes = basicHeader.toBytes();
        expect(basicHeaderBytes.length).toBe(HEADER_SIZE);
        expect(basicHeaderBytes).toEqual(Buffer.from([0x55, 0x50, 0x58, 0x4c, 0x0a, 0x03]));
    });

    it('handles invalid channels', () => {
        expect(() => { new PBXHeader(-1, PBX_RECORD_TYPES.DRAW_ALL); }).toThrow(Error);
        expect(() => { new PBXHeader(64, PBX_RECORD_TYPES.DRAW_ALL); }).toThrow(Error);
    });
});
