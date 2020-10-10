import { CHANNEL_MAX, PBX_RECORD_TYPES } from './constants';

export const HEADER_SIZE = 6;

export class PBXHeader {
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

        this.magic = "UPXL";
    }

    writeBytes(buffer, offset = 0) {
        offset = buffer.write(this.magic, offset);
        offset = buffer.writeUInt8(this.channel, offset);
        buffer.writeUInt8(this.recordType, offset);
    }

    toBytes() {
        const result = Buffer.alloc(HEADER_SIZE, 0);
        this.writeBytes(result);
        return result;
    }
}

