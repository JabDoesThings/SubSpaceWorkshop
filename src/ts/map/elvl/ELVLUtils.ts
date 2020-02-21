import {
    ELVLAttribute,
    ELVLChunk,
    ELVLChunkType,
    ELVLCollection,
    ELVLRawChunk,
    ELVLRegion, ELVLRegionAutoWarp, ELVLRegionOptions, ELVLRegionRawChunk, ELVLRegionTileData,
    ELVLRegionType
} from './ELVL';
import { BufferUtils } from '../../util/BufferUtils';

export class ELVL {

    public static readonly DEFAULT_REGION_OPTIONS: ELVLRegionOptions = {
        isFlagBase: false,
        noAntiWarp: false,
        noWeapons: false,
        noFlagDrops: false,
    };

    public static readonly HEADER_SIGNATURE = 1819700325 /*elvl*/;

    public static read(buffer: Buffer): ELVLCollection {
        let eStartOffset;
        let eOffset = buffer.readUInt32LE(6);
        if (eOffset == 0) {
            return null;
        }
        eStartOffset = eOffset;

        let signature = buffer.readUInt32LE(eOffset);
        eOffset += 4;
        console.log("offset: " + eOffset + " signature: " + signature + " valid_signature: " + ELVL.HEADER_SIGNATURE);
        if (signature != ELVL.HEADER_SIGNATURE) {
            return;
        }
        console.log("ELVL data is present.");

        let eSectionLength = buffer.readUInt32LE(eOffset);
        let eSectionEnd = eStartOffset + eSectionLength;
        eOffset += 4;

        let eReserved = buffer.readUInt32LE(eOffset);
        eOffset += 4;
        if (eReserved != 0) {
            console.log("ELVL header's 3rd UInt32 value is not 0 and is invalid.");
            return null;
        }

        let readAttribute = (): ELVLAttribute => {
            let size = buffer.readUInt32LE(eOffset);
            eOffset += 4;
            let ascii = BufferUtils.readFixedString(buffer, eOffset, size);
            eOffset += size;
            let split = ascii.split('=');
            let key = split[0];
            let value = split[1];

            // Pad to the next 4 bytes.
            let remainder = size % 4;
            if (remainder != 0) {
                eOffset += 4 - remainder;
            }

            console.log("Adding ELVLAttribute('" + key + "', '" + value + "').");
            return new ELVLAttribute(key, value);
        };

        let readRegion = (): ELVLRegion => {

            let name: string = null;
            let tileData: ELVLRegionTileData = null;
            let autoWarp: ELVLRegionAutoWarp = null;
            let options = {
                isFlagBase: false,
                noAntiWarp: false,
                noWeapons: false,
                noFlagDrops: false
            };
            let pythonCode: string = null;
            let unknowns: ELVLRegionRawChunk[] = [];

            let size = buffer.readUInt32LE(eOffset);

            eOffset += 4;
            let end = eOffset + size;

            while (eOffset < end) {

                let subChunkType = buffer.readUInt32LE(eOffset);
                eOffset += 4;

                if (subChunkType === ELVLRegionType.REGION_NAME) {

                    let nameSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    console.log("\tReading REGION_NAME... (size=" + nameSize + ")");

                    name = BufferUtils.readFixedString(buffer, eOffset, nameSize);
                    eOffset += nameSize;

                    // Pad to the next 4 bytes.
                    let remainder = nameSize % 4;
                    if (remainder != 0) {
                        eOffset += 4 - remainder;
                    }

                } else if (subChunkType == ELVLRegionType.REGION_TILE_DATA) {

                    let tdSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    console.log("\tReading REGION_TILE_DATA... (size=" + tdSize + ")");

                    // TODO: Implement. Skip for now.
                    eOffset += tdSize;

                    // Pad to the next 4 bytes.
                    let remainder = tdSize % 4;
                    if (remainder != 0) {
                        eOffset += 4 - remainder;
                    }

                    tileData = new ELVLRegionTileData();

                } else if (subChunkType == ELVLRegionType.REGION_BASE_FLAG) {

                    console.log("\tReading REGION_BASE_FLAG... (size=" + 0 + ")");

                    eOffset += 4; // Size will always be zero.
                    options.isFlagBase = true;
                } else if (subChunkType == ELVLRegionType.REGION_NO_ANTIWARP) {

                    console.log("\tReading REGION_NO_ANTIWARP... (size=" + 0 + ")");

                    eOffset += 4; // Size will always be zero.
                    options.noAntiWarp = true;
                } else if (subChunkType == ELVLRegionType.REGION_NO_WEAPONS) {

                    console.log("\tReading REGION_NO_WEAPONS... (size=" + 0 + ")");

                    eOffset += 4; // Size will always be zero.
                    options.noWeapons = true;
                } else if (subChunkType == ELVLRegionType.REGION_NO_FLAG_DROPS) {

                    console.log("\tReading REGION_NO_FLAG_DROPS... (size=" + 0 + ")");

                    eOffset += 4; // Size will always be zero.
                    options.noFlagDrops = true;
                } else if (subChunkType == ELVLRegionType.REGION_AUTO_WARP) {

                    let awSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    console.log("\tReading REGION_AUTO_WARP... (size=" + awSize + ")");

                    let x: number = 0;
                    let y: number = 0;
                    let arena: string = null;

                    x = buffer.readInt16LE(eOffset);
                    eOffset += 2;
                    y = buffer.readInt16LE(eOffset);
                    eOffset += 2;

                    if (awSize > 8) {
                        awSize -= 8;
                        arena = BufferUtils.readFixedString(buffer, eOffset, awSize);
                    }

                    // Pad to the next 4 bytes.
                    let remainder = awSize % 4;
                    if (remainder != 0) {
                        eOffset += 4 - remainder;
                    }

                    autoWarp = new ELVLRegionAutoWarp(x, y, arena);

                } else if (subChunkType == ELVLRegionType.REGION_PYTHON_CODE) {

                    let pycSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    console.log("\tReading REGION_PYTHON_CODE... (size=" + pycSize + ")");

                    pythonCode = BufferUtils.readFixedString(buffer, eOffset, pycSize);

                    // Pad to the next 4 bytes.
                    let remainder = pycSize % 4;
                    if (remainder != 0) {
                        eOffset += 4 - remainder;
                    }
                } else {
                    console.warn(
                        "\tUnknown REGION sub-type: "
                        + BufferUtils.readFixedString(buffer, eOffset - 4, 4)
                        + " ("
                        + subChunkType
                        + "). Adding as raw data chunk."
                    );

                    let uSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    let uData = buffer.subarray(eOffset, eOffset + uSize);
                    eOffset += uSize;

                    unknowns.push(new ELVLRegionRawChunk(subChunkType, uData));
                }

            }

            console.log("Adding ELVLRegion('" + name + ", " + options + ", " + tileData + ", " + autoWarp + ", " + pythonCode + ").");

            return new ELVLRegion(name, options, tileData, autoWarp, pythonCode, unknowns);
        };

        let readRawChunk = (type: number): ELVLRawChunk => {

            let size = buffer.readUInt32LE(eOffset);
            eOffset += 4;

            // Pad to the next 4 bytes.
            let remainder = size % 4;
            if (remainder != 0) {
                size += 4 - remainder;
            }

            console.log("size: " + size);

            let data = buffer.subarray(eOffset, eOffset + size);
            eOffset += size;

            console.log("Adding ELVLRawChunk('" + type + "', " + data.length + " byte(s)).");
            return new ELVLRawChunk(type, data);
        };

        let eCollection = new ELVLCollection();

        while (eOffset < eSectionEnd) {
            let type: ELVLChunkType = buffer.readUInt32LE(eOffset);
            eOffset += 4;
            let chunk: ELVLChunk;

            if (type == ELVLChunkType.ATTRIBUTE) {
                chunk = readAttribute();
            } else if (type == ELVLChunkType.REGION) {
                chunk = readRegion();
            } else {
                console.warn(
                    "Unknown type: "
                    + BufferUtils.readFixedString(buffer, eOffset - 4, 4)
                    + " ("
                    + type
                    + "). Adding as raw data chunk."
                );
                chunk = readRawChunk(type);
            }

            eCollection.addChunk(chunk);
        }
    }

    public static write(): void {

        let buffer: Buffer = null;
        let totalBytes = 0;

        // ### ELVL HEADER ###
        buffer.writeUInt32LE(0x6c766c65 /*'elvl' header*/, 0);
        buffer.writeUInt32LE(totalBytes, 4); // The number of bytes in the whole metadata section.
        buffer.writeUInt32LE(0, 8);

        let offset = 12;

        let writeChunk = (chunk: { type: number, size: number }) => {

            // ### CHUNK HEADER ###

            // describes what this chunk represents
            buffer.writeUInt32LE(chunk.type, offset);
            offset += 4;

            // The number of bytes in the data portion of this chunk, NOT including the header.
            buffer.writeUInt32LE(chunk.size, offset);
            offset += 4;
        };

    }
}
