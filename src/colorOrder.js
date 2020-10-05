
export class PBColorOrder {
    constructor(...locations) {
        this.length = locations.length;
        if (this.length < 3 || this.length > 4) {
            throw new Error(`Color order (${JSON.stringify(locations)}) should be 3 or 4 numbers.`);
        }
        this.locations = locations;
        this.union = 0;
        this.locations.forEach((location, idx) => {
            this.union = this.union | ((location & 0b11) << (idx * 2));
        });
    }

    writeColor(buffer, color, offset) {
        if (color.length !== this.length) {
            throw new Error(
                `color (${JSON.stringify(color)}) has the wrong length, expected ${this.length}`);
        }
        this.locations.forEach((location, idx) => {
            if (location < 0)
                return;
            buffer.writeUInt8(color[idx], offset + location);
        });
        return offset + this.length;
    }
}

export const PBX_COLOR_ORDERS = {
    RGBW: new PBColorOrder(0, 1, 2, 3),
    RGBV: new PBColorOrder(0, 1, 2, -1),
    RGB: new PBColorOrder(0, 1, 2),
};
