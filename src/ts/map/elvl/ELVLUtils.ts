import {
    ELVLAttribute,
    ELVLChunk,
    ELVLChunkType,
    ELVLCollection, ELVLDCMEWallTile,
    ELVLRawChunk,
    ELVLRegion,
    ELVLRegionAutoWarp,
    ELVLRegionOptions,
    ELVLRegionRawChunk,
    ELVLRegionTileData,
    ELVLRegionType
} from './ELVL';
import { BufferUtils } from '../../util/BufferUtils';

export class ELVL {

    private static readonly REGION_TILEDATA_SMALL_EMPTY_RUN = 0;
    private static readonly REGION_TILEDATA_LONG_EMPTY_RUN = 1;
    private static readonly REGION_TILEDATA_SMALL_PRESENT_RUN = 2;
    private static readonly REGION_TILEDATA_LONG_PRESENT_RUN = 3;
    private static readonly REGION_TILEDATA_SMALL_EMPTY_ROWS = 4;
    private static readonly REGION_TILEDATA_LONG_EMPTY_ROWS = 5;
    private static readonly REGION_TILEDATA_SMALL_REPEAT = 6;
    private static readonly REGION_TILEDATA_LONG_REPEAT = 7;

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

        let getBitFragment = (extractFrom: number, startIndex: number, endIndex: number): number => {
            let shift = 8 - endIndex;
            let numBits = endIndex - startIndex + 1;
            let mask = ((0x01 << numBits) - 1);
            return (extractFrom >> shift) & mask;
        };

        let getEncodedType = (typeByte: number): number => {
            return getBitFragment(typeByte, 1, 3);
        };

        let getEncodedLength1 = (one: number): number => {
            return getBitFragment(one, 4, 8) + 1;
        };

        let getEncodedLength2 = (one: number, two: number): number => {
            let highByte = getBitFragment(one, 7, 8) << 8;
            return (highByte | (0xFF & two)) + 1;
        };

        let getEncodedLength = (buffer: Buffer, type: number): number => {
            if (type % 2 == 0) {
                // Short.
                let result = getEncodedLength1(buffer.readUInt16LE(eOffset));
                eOffset += 2;
                return result;
            } else {
                let one = buffer.readInt16LE(eOffset);
                eOffset += 2;
                let two = buffer.readInt16LE(eOffset);
                eOffset += 2;
                return getEncodedLength2(one, two);
            }
        };

        let decodeTiles = (endByte: number): boolean[][] => {

            // Create a new blank array.
            let tiles: boolean[][] = new Array(1024);
            for (let x = 0; x < 1024; x++) {
                tiles[x] = new Array(1024);
                for (let y = 0; y < 1024; y++) {
                    tiles[x][y] = false;
                }
            }

            let curX = 0;
            let curY = 0;

            while (eOffset < endByte) {

                let typeByte = buffer.readUInt8(eOffset);
                eOffset++;

                let type = getEncodedType(typeByte);

                let len = getEncodedLength(buffer, type);

                if (type == ELVL.REGION_TILEDATA_SMALL_EMPTY_RUN
                    || type == ELVL.REGION_TILEDATA_LONG_EMPTY_RUN) {

                    if (len + curX > 1024) {
                        console.warn("empty run extends past end");
                        break;
                    }

                    curX += len;

                } else if (type == ELVL.REGION_TILEDATA_SMALL_PRESENT_RUN
                    || type == ELVL.REGION_TILEDATA_LONG_PRESENT_RUN) {

                    if (len + curX > 1024) {
                        console.warn("present run extends past end");
                        break;
                    }

                    let stopX = curX + len;

                    for (let x = curX; x < stopX; x++) {
                        tiles[curY][x] = true;
                    }

                    curX += len;

                } else if (type == ELVL.REGION_TILEDATA_SMALL_EMPTY_ROWS
                    || type == ELVL.REGION_TILEDATA_LONG_EMPTY_ROWS) {

                    if (curX != 0) {
                        console.warn("empty row occurred before a run was over, curX = " + curX);
                        break;
                    }

                    curY += len;

                } else if (type == ELVL.REGION_TILEDATA_SMALL_REPEAT
                    || type == ELVL.REGION_TILEDATA_LONG_REPEAT) {

                    if (curX != 0) {
                        console.warn("repeat occurred before a run was over.");
                        break;
                    }
                    if (curY == 0) {
                        console.warn("repeat occurred in the first row.");
                        break;
                    }

                    let stopY = curY + len;
                    let copyY = curY - 1;

                    for (let x = 0; x < 1024; x++) {
                        for (let y = curY; y < stopY; y++) {
                            tiles[y][x] = tiles[copyY][x];
                        }
                    }

                    curY += len;
                }

                if (curX == 1024) {
                    curY++;
                    curX = 0;
                }

                if (type % 2 == 0) {
                    // Short.
                    eOffset++;
                } else {
                    // Long.
                    eOffset += 2;
                }
            }

            if (curY != 1024) {
                console.warn("Encoded rTIL does NOT contain 1024 rows... it has " + curY);
            }

            return tiles;
        };

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
            let color = [0, 0, 0];

            eOffset += 4;
            let end = eOffset + size;

            while (eOffset < end) {

                let subChunkType = buffer.readUInt32LE(eOffset);
                eOffset += 4;

                if (subChunkType === ELVLRegionType.NAME) {

                    let nameSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    console.log("\tReading NAME... (size=" + nameSize + ")");

                    name = BufferUtils.readFixedString(buffer, eOffset, nameSize);
                    eOffset += nameSize;

                    // Pad to the next 4 bytes.
                    let remainder = nameSize % 4;
                    if (remainder != 0) {
                        eOffset += 4 - remainder;
                    }

                } else if (subChunkType == ELVLRegionType.TILE_DATA) {

                    let tdSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    console.log("\tReading TILE_DATA... (size=" + tdSize + ")");

                    let tiles = decodeTiles(eOffset += tdSize);

                    // Pad to the next 4 bytes.
                    let remainder = tdSize % 4;
                    if (remainder != 0) {
                        eOffset += 4 - remainder;
                    }

                    tileData = new ELVLRegionTileData(tiles);

                } else if (subChunkType == ELVLRegionType.BASE_FLAG) {

                    console.log("\tReading BASE_FLAG... (size=" + 0 + ")");

                    eOffset += 4; // Size will always be zero.
                    options.isFlagBase = true;
                } else if (subChunkType == ELVLRegionType.NO_ANTIWARP) {

                    console.log("\tReading NO_ANTIWARP... (size=" + 0 + ")");

                    eOffset += 4; // Size will always be zero.
                    options.noAntiWarp = true;
                } else if (subChunkType == ELVLRegionType.NO_WEAPONS) {

                    console.log("\tReading NO_WEAPONS... (size=" + 0 + ")");

                    eOffset += 4; // Size will always be zero.
                    options.noWeapons = true;
                } else if (subChunkType == ELVLRegionType.NO_FLAG_DROPS) {

                    console.log("\tReading NO_FLAG_DROPS... (size=" + 0 + ")");

                    eOffset += 4; // Size will always be zero.
                    options.noFlagDrops = true;
                } else if (subChunkType == ELVLRegionType.AUTO_WARP) {

                    let awSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    console.log("\tReading AUTO_WARP... (size=" + awSize + ")");

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

                } else if (subChunkType == ELVLRegionType.PYTHON_CODE) {

                    let pycSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    console.log("\tReading PYTHON_CODE... (size=" + pycSize + ")");

                    pythonCode = BufferUtils.readFixedString(buffer, eOffset, pycSize);

                    // Pad to the next 4 bytes.
                    let remainder = pycSize % 4;
                    if (remainder != 0) {
                        eOffset += 4 - remainder;
                    }

                } else if (subChunkType == ELVLRegionType.DCME_COLOR) {

                    let cSize = buffer.readUInt32LE(eOffset);
                    eOffset += 4;

                    console.log("\tReading DCME_COLOR... (size=" + cSize + ")");

                    let red = buffer.readUInt8(eOffset++);
                    let green = buffer.readUInt8(eOffset++);
                    let blue = buffer.readUInt8(eOffset++);
                    eOffset++; // Will always be unused.
                    color = [red, green, blue];

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

            let region = new ELVLRegion(name, options, tileData, autoWarp, pythonCode, unknowns);
            region.color = color;
            return region;
        };

        let readDCMEWallTile = (): ELVLDCMEWallTile => {
            let wtSize = buffer.readUInt32LE(eOffset);
            eOffset += 4;
            if (wtSize != 16) {
                throw new Error("The size for DCME Wall-Tile chunks can only be 16. (" + wtSize + " given)");
            }

            // Read the 16 tiles.
            let tiles: number[] = new Array(16);
            for (let index = 0; index < 16; index++) {
                tiles[index] = buffer.readUInt8(eOffset++);
            }

            return new ELVLDCMEWallTile(tiles);
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
            } else if (type == ELVLChunkType.DCME_WALL_TILES) {
                chunk = readDCMEWallTile();
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

        console.log(eCollection);

        return eCollection;
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
