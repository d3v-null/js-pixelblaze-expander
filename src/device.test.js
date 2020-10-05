import {ExpanderDevice} from "./device";
import SerialPort from "serialport";

jest.mock("SerialPort");

const testOptions = {
    baudRate: 123,
    databits: 7,
    stopBits: 2,
    parity: "whatever",
    channels: {
        2: {
            type: "WS2812",
            order: "RGB",
            capacity: 1,
        },
        1: {
            type: "WS2812",
            order: "RGB",
            capacity: 2,
        },
    },
};

describe("ExpanderDevice", () => {
    it("creates a device", () => {
        const device = new ExpanderDevice("portName", testOptions);
        expect(device.channelMessages).toMatchObject({
            1: {
                baseSize: 4,
                buffer: Buffer.from([
                    85,
                    80,
                    88,
                    76,
                    1,
                    1,
                    3,
                    36,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                ]),
                capacity: 2,
                header: {channel: "1", recordType: 1},
                order: {length: 3, locations: [0, 1, 2], union: 36},
                pixelSize: 6,
                size: 20,
            },
            2: {
                baseSize: 4,
                buffer: Buffer.from([85, 80, 88, 76, 2, 1, 3, 36, 1, 0, 0, 0, 0, 0, 0, 0, 0]),
                capacity: 1,
                header: {channel: "2", recordType: 1},
                order: {length: 3, locations: [0, 1, 2], union: 36},
                pixelSize: 3,
                size: 17,
            },
        });
        expect(SerialPort.mock.calls).toMatchObject([
            ["portName", {baudRate: 123, dataBits: 8, parity: "whatever", stopBits: 2}],
        ]);
    });
    it("sends colour data, drawAll=false", () => {
        const device = new ExpanderDevice("portName", testOptions);
        device.send(2, [[10, 11, 12]], false);
        expect(device.port.write.mock.calls.length).toBe(1);
        expect(device.port.write.mock.calls[0][0]).toMatchObject(
            Buffer.from([85, 80, 88, 76, 2, 1, 3, 36, 1, 0, 10, 11, 12, 128, 15, 109, 244])
        );
    });
    it("sends colour data, drawAll=true", () => {
        const device = new ExpanderDevice("portName", testOptions);
        device.send(2, [[10, 11, 12]], true);
        expect(device.port.write.mock.calls.length).toBe(2);
        expect(device.port.write.mock.calls[0][0]).toMatchObject(
            Buffer.from([85, 80, 88, 76, 2, 1, 3, 36, 1, 0, 10, 11, 12, 128, 15, 109, 244])
        );
        expect(device.port.write.mock.calls[1][0]).toMatchObject(
            Buffer.from([85, 80, 88, 76, 0, 2, 233, 197, 165, 76])
        );
    });
});
