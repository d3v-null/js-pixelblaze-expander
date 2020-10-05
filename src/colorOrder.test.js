import { PBColorOrder } from "./colorOrder";

describe('PBColorOrder', () => {
    it('writes RGB colors correctly', () => {
        const order = new PBColorOrder(0, 1, 2);
        const result = Buffer.alloc(3);
        order.writeColor(result, [0x01, 0x02, 0x03], 0);
        expect(result).toEqual(Buffer.from([0x01, 0x02, 0x03]));
    });
    it('writes BGR colors correctly', () => {
        const order = new PBColorOrder(2, 1, 0);
        const result = Buffer.alloc(3);
        order.writeColor(result, [0x01, 0x02, 0x03], 0);
        expect(result).toEqual(Buffer.from([0x03, 0x02, 0x01]));
    });
});
