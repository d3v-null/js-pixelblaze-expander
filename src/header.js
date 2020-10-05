import { CHANNEL_MAX, PBX_RECORD_TYPES } from './constants';


export class PBXHeader {
    static size = 6;
    static magic = "UPXL";

    constructor(channel, recordType) {
        if (channel >= CHANNEL_MAX) {
            throw new Error(`Channel ${channel} larger than channel maximum, ${CHANNEL_MAX}`);
        } else if (channel < 0) {
            throw new Error(`Channel ${channel} can't be less than zero`);
        }
        this.channel = channel;

        if (!Object.values(PBX_RECORD_TYPES).includes(recordType)) {
            throw new Error(`Record type ${recordType} is not one of ${JSON.stringify(PBX_RECORD_TYPES)}`);
        }
        this.recordType = recordType;
    }

    writeBytes(buffer, offset = 0) {
        offset = buffer.write(PBXHeader.magic, offset);
        offset = buffer.writeUInt8(this.channel, offset);
        offset = buffer.writeUInt8(this.recordType, offset);
    }

    toBytes() {
        const result = Buffer.alloc(PBXHeader.size, 0);
        this.writeBytes(result);
        return result;
    }
}
function fmt_uint8(n) {
    return `0x${(n >>> 0).toString(16).padStart(2, '0')} `
        + `(0b${(n >>> 0).toString(2).padStart(8, '0')} => ${(n >>> 0).toString(10)})`;
}
function fmt_uint32(n) {
    return `0x${(n >>> 0).toString(16).padStart(8, '0')} `
        + `(0b${(n >>> 0).toString(2).padStart(32, '0')} => ${(n >>> 0).toString(10)})`;
}
export function fmt_array_uint8(arr, indices = []) {
    const hex = arr.reduce((col, b, idx) => {
        return col + (indices.includes(idx) ? '|' : '') + (b >>> 0).toString(16).padStart(2, '0');
    }, '');
    return `0x${hex} (${arr.length})`;
}
