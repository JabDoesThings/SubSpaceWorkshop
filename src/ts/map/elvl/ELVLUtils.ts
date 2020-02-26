import {
    ELVLAttribute,
    ELVLChunk,
    ELVLCollection,
    ELVLHashCode, ELVLLVZPath,
    ELVLTextTiles,
    ELVLWallTiles,
    ELVLRawChunk,
    ELVLRegion,
    ELVLRegionAutoWarp, ELVLRegionChunk,
    ELVLRegionOptions,
    ELVLRegionRawChunk,
    ELVLRegionTileData, ELVLBookmarks
} from './ELVL';
import { BufferUtils } from '../../util/BufferUtils';

/**
 * The <i>ELVL</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVL {

    static handlers: { [id: string]: ELVLChunkHandler<ELVLChunk> } = {};

    static readonly DEBUG = true;

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
            return new ELVLCollection();
        }
        eStartOffset = eOffset;

        let signature = buffer.readUInt32LE(eOffset);
        eOffset += 4;
        if (ELVL.DEBUG) {
            console.log("offset: " + eOffset + " signature: " + signature + " valid_signature: " + ELVL.HEADER_SIGNATURE);
        }
        if (signature != ELVL.HEADER_SIGNATURE) {
            return;
        }
        if (ELVL.DEBUG) {
            console.log("ELVL data is present.");
        }
        let eSectionLength = buffer.readUInt32LE(eOffset);
        let eSectionEnd = eStartOffset + eSectionLength;
        eOffset += 4;

        let eReserved = buffer.readUInt32LE(eOffset);
        eOffset += 4;
        if (eReserved != 0) {
            if (ELVL.DEBUG) {
                console.warn("ELVL header's 3rd UInt32 value is not 0 and is invalid.");
            }
            return null;
        }

        let eCollection = new ELVLCollection();

        while (eOffset < eSectionEnd) {

            let cId = BufferUtils.readFixedString(buffer, eOffset, 4);
            let cSize = buffer.readUInt32LE(eOffset + 4);
            let cBuffer = buffer.subarray(eOffset + 8, eOffset + 8 + cSize);
            eOffset += 8 + cSize;

            // Pad to the next 4 bytes.
            let remainder = cSize % 4;
            if (remainder != 0) {
                eOffset += 4 - remainder;
            }

            if (cId === 'ATTR') {
                let attribute = (<ELVLAttributeHandler> ELVL.handlers['ATTR']).read(cBuffer);
                eCollection.addAttribute(attribute);
            } else if (cId === 'REGN') {
                let region = (<ELVLRegionHandler> ELVL.handlers['REGN']).read(cBuffer);
                eCollection.addRegion(region);
            } else {

                let chunk: ELVLChunk;

                let handler = ELVL.handlers[cId];

                if (handler != null) {
                    chunk = handler.read(cBuffer);
                }

                if (chunk == null) {
                    if (ELVL.DEBUG) {
                        console.warn("Unknown ELVL Chunk ID '" + cId + "'. Adding as raw data chunk.");
                    }
                    eCollection.addChunk(new ELVLRawChunk(cId, cBuffer));
                    continue;
                }

                eCollection.addChunk(handler.read(cBuffer));
            }
        }

        return eCollection;
    }
}

/**
 * The <i>ELVLChunkHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class ELVLChunkHandler<C extends ELVLChunk> {

    id: string;

    protected constructor(id: string) {
        this.id = id;
    }

    abstract read(buffer: Buffer): C;

    abstract write(chunk: C): Buffer;
}

/**
 * The <i>ELVLAttributeHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLAttributeHandler extends ELVLChunkHandler<ELVLAttribute> {

    constructor() {
        super("ATTR");
    }

    // @Override
    read(buffer: Buffer): ELVLAttribute {

        let ascii = BufferUtils.readFixedString(buffer, 0, buffer.length);
        let split = ascii.split('=');

        return new ELVLAttribute(split[0], split[1]);
    }

    // @Override
    write(chunk: ELVLAttribute): Buffer {
        return null;
    }
}

/**
 * The <i>ELVLRegionHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionHandler extends ELVLChunkHandler<ELVLRegion> {

    static readonly handlers: { [id: string]: ELVLRegionChunkHandler<ELVLRegionChunk> } = {};

    constructor() {
        super('REGN');
    }

    // @Override
    read(buffer: Buffer): ELVLRegion {

        let offset = 0;

        let name: string = null;

        let tileData: ELVLRegionTileData = null;
        let autoWarp: ELVLRegionAutoWarp = null;
        let chunks: ELVLRegionChunk[] = [];
        let pythonCode: string = null;
        let color: number[] = [0, 0, 0];

        let options = {
            isFlagBase: false,
            noAntiWarp: false,
            noWeapons: false,
            noFlagDrops: false
        };

        while (offset < buffer.length) {

            let subChunkId = BufferUtils.readFixedString(buffer, offset, 4);
            let subChunkSize = buffer.readUInt32LE(offset + 4);
            let subChunkBuffer = buffer.subarray(offset + 8, offset + 8 + subChunkSize);
            offset += 8 + subChunkSize;

            // Pad to the next 4 bytes.
            let remainder = subChunkSize % 4;
            if (remainder != 0) {
                offset += 4 - remainder;
            }

            if (subChunkId === 'rNAM') {
                name = BufferUtils.readFixedString(subChunkBuffer, 0, subChunkSize);
            } else if (subChunkId === 'rTIL') {
                tileData = (<ELVLRegionTileMapHandler> ELVLRegionHandler.handlers['rTIL']).read(subChunkBuffer);
            } else if (subChunkId === 'rBSE') {
                options.isFlagBase = true;
            } else if (subChunkId === 'rNAW') {
                options.noAntiWarp = true;
            } else if (subChunkId === 'rNWP') {
                options.noWeapons = true;
            } else if (subChunkId === 'rNFL') {
                options.noFlagDrops = true;
            } else if (subChunkId === 'rAWP') {
                autoWarp = (<ELVLRegionAutoWarpHandler> ELVLRegionHandler.handlers['rAWP']).read(subChunkBuffer);
            } else if (subChunkId === 'rPYC') {
                pythonCode = BufferUtils.readFixedString(subChunkBuffer, 0, subChunkSize);
            } else if (subChunkId === 'rCOL') {

                let red = subChunkBuffer.readUInt8(0);
                let green = subChunkBuffer.readUInt8(1);
                let blue = subChunkBuffer.readUInt8(2);

                color = [red, green, blue];

            } else {

                let handler = ELVL.handlers[subChunkId];

                if (handler == null) {

                    if (ELVL.DEBUG) {
                        console.warn("Unknown ELVL Chunk ID '" + subChunkId + "'. Adding as raw data chunk.");
                    }

                    chunks.push(new ELVLRegionRawChunk(subChunkId, subChunkBuffer));
                    continue;
                }

                if (ELVL.DEBUG) {
                    console.log("Reading ELVL Chunk '" + subChunkId + "'. (" + subChunkSize + " byte(s))");
                }

                chunks.push(handler.read(subChunkBuffer));
            }
        }

        let region = new ELVLRegion(name, options, tileData, autoWarp, pythonCode, chunks);
        region.color = color;
        return region;
    }

    // @Override
    write(chunk: ELVLChunk): Buffer {
        return null;
    }
}

/**
 * The <i>ELVLWallTilesHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLWallTilesHandler extends ELVLChunkHandler<ELVLWallTiles> {

    constructor() {
        super('DCWT');
    }

    read(buffer: Buffer): ELVLWallTiles {

        if (buffer.length != 16) {
            throw new Error(
                "The size for DCME Wall-Tile chunks can only be 16. (" + buffer.length + " given)");
        }

        // Read the 16 tiles.
        let tiles: number[] = new Array(16);
        for (let index = 0; index < 16; index++) {
            tiles[index] = buffer.readUInt8(index);
        }

        return new ELVLWallTiles(tiles);
    }

    write(chunk: ELVLWallTiles): Buffer {

        chunk.validate();

        let buffer = Buffer.alloc(16);

        // Write each tile ID as the offset of the index.
        for (let index = 0; index < 16; index++) {
            buffer.writeUInt8(chunk.tiles[index], index);
        }

        return buffer;
    }
}

/**
 * The <i>ELVLTextTilesHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLTextTilesHandler extends ELVLChunkHandler<ELVLTextTiles> {

    constructor() {
        super('DCTT');
    }

    // @Override
    read(buffer: Buffer): ELVLTextTiles {

        // Create a blank character map.
        let charMap = new Array(256);
        for (let index = 0; index < charMap.length; index++) {
            charMap[index] = 0;
        }

        let offset = 0;

        while (offset < buffer.length) {
            let charValue = buffer.readUInt8(offset++);
            charMap[charValue] = buffer.readUInt8(offset++);
        }

        return new ELVLTextTiles(charMap);
    }

    // @Override
    write(chunk: ELVLTextTiles): Buffer {

        chunk.validate();

        // Create a compressed character map to write to a buffer.
        let map = [];
        for (let index = 0; index < chunk.charMap.length; index++) {
            let tileId = chunk.charMap[index];
            if (tileId > 0) {
                map.push(index);
                map.push(tileId);
            }
        }

        // Write the compressed character map to the buffer.
        let buffer = Buffer.alloc(map.length);
        for (let index = 0; index < map.length; index++) {
            buffer.writeUInt8(map[index], index);
        }

        return buffer;
    }
}

/**
 * The <i>ELVLHashCodeHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLHashCodeHandler extends ELVLChunkHandler<ELVLHashCode> {

    constructor() {
        super('DCID');
    }

    // @Override
    read(buffer: Buffer): ELVLHashCode {

        let hashCode = BufferUtils.readFixedString(buffer, 0, buffer.length);

        return new ELVLHashCode(hashCode);
    }

    // @Override
    write(chunk: ELVLHashCode): Buffer {

        chunk.validate();

        let buffer = Buffer.alloc(chunk.hashCode.length);

        BufferUtils.writeFixedString(buffer, chunk.hashCode, 0);

        return buffer;
    }
}

/**
 * The <i>ELVLBookmarksHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLBookmarksHandler extends ELVLChunkHandler<ELVLBookmarks> {

    constructor() {
        super('DCBM');
    }

    // @Override
    read(buffer: Buffer): ELVLBookmarks {
        return new ELVLBookmarks(buffer);
    }

    // @Override
    write(chunk: ELVLBookmarks): Buffer {
        return chunk.data;
    }
}

/**
 * The <i>ELVLLVZPathHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLLVZPathHandler extends ELVLChunkHandler<ELVLLVZPath> {

    constructor() {
        super('DCBM');
    }

    // @Override
    read(buffer: Buffer): ELVLLVZPath {
        return new ELVLLVZPath(buffer);
    }

    // @Override
    write(chunk: ELVLLVZPath): Buffer {
        return chunk.data;
    }
}

/**
 * The <i>ELVLRegionChunkHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class ELVLRegionChunkHandler<C extends ELVLRegionChunk> {

    id: string;

    protected constructor(id: string) {
        this.id = id;
    }

    abstract read(buffer: Buffer): C;

    abstract write(chunk: C): Buffer;
}

/**
 * The <i>ELVLRegionTileMapHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionTileMapHandler extends ELVLRegionChunkHandler<ELVLRegionTileData> {

    private static readonly SMALL_EMPTY_RUN = 0;
    private static readonly LONG_EMPTY_RUN = 1;
    private static readonly SMALL_PRESENT_RUN = 2;
    private static readonly LONG_PRESENT_RUN = 3;
    private static readonly SMALL_EMPTY_ROWS = 4;
    private static readonly LONG_EMPTY_ROWS = 5;
    private static readonly SMALL_REPEAT = 6;
    private static readonly LONG_REPEAT = 7;

    constructor() {
        super('rTIL');
    }

    // @Override
    read(buffer: Buffer): ELVLRegionTileData {

        let offset = 0;

        // Create a new blank array.
        let tiles: boolean[][] = new Array(1024);
        for (let x = 0; x < 1024; x++) {
            tiles[x] = new Array(1024);
            for (let y = 0; y < 1024; y++) {
                tiles[x][y] = false;
            }
        }

        let tilesInRow: number = 0;
        let rowsCounted: number = 0;

        let byte1: number = 0;
        let byte2: number = 0;
        let value: number = 0;

        while (offset < buffer.length && rowsCounted < 1024) {

            byte1 = buffer.readUInt8(offset++);

            let b1check = Math.floor(byte1 / 32);

            if (b1check == ELVLRegionTileMapHandler.SMALL_EMPTY_RUN) {

                // 000nnnnn - n+1 (1-32) empty tiles in a row
                value = byte1 % 32 + 1;

                for (let x = tilesInRow; x < tilesInRow + value; x++) {
                    tiles[x][rowsCounted] = false;
                }

                tilesInRow += value;

            } else if (b1check == ELVLRegionTileMapHandler.LONG_EMPTY_RUN) {

                // 001000nn nnnnnnnn - n+1 (1-1024) empty tiles in a row
                byte2 = buffer.readUInt8(offset++);
                value = 256 * (byte1 % 4) + byte2 + 1;

                for (let x = tilesInRow; x < tilesInRow + value; x++) {
                    tiles[x][rowsCounted] = false;
                }

                tilesInRow += value;

            } else if (b1check == ELVLRegionTileMapHandler.SMALL_PRESENT_RUN) {

                // 010nnnnn - n+1 (1-32) present tiles in a row
                value = byte1 % 32 + 1;

                if (tilesInRow + value > 1024) {
                    if (ELVL.DEBUG) {
                        console.warn("Something's wrong. More than 1024 tiles in that row.");
                    }
                } else {
                    for (let x = tilesInRow; x < tilesInRow + value; x++) {
                        tiles[x][rowsCounted] = true;
                    }
                }

                tilesInRow += value;

            } else if (b1check == ELVLRegionTileMapHandler.LONG_PRESENT_RUN) {

                // 011000nn nnnnnnnn - n+1 (1-1024) present tiles in a row
                byte2 = buffer.readUInt8(offset++);
                value = 256 * (byte1 % 4) + byte2 + 1;

                if (tilesInRow + value > 1024) {
                    if (ELVL.DEBUG) {
                        console.warn("Something's wrong. More than 1024 tiles in that row.");
                    }
                } else {
                    for (let x = tilesInRow; x < tilesInRow + value; x++) {
                        tiles[x][rowsCounted] = true;
                    }
                }

                tilesInRow += value;

            } else if (b1check == ELVLRegionTileMapHandler.SMALL_EMPTY_ROWS) {

                // 100nnnnn - n+1 (1-32) rows of all empty
                value = byte1 % 32 + 1;

                rowsCounted += value;

            } else if (b1check == ELVLRegionTileMapHandler.LONG_EMPTY_ROWS) {

                // 101000nn nnnnnnnn - n+1 (1-1024) rows of all empty
                byte2 = buffer.readUInt8(offset++);
                value = 256 * (byte1 % 4) + byte2 + 1;

                rowsCounted += value;

            } else if (b1check == ELVLRegionTileMapHandler.SMALL_REPEAT) {

                // 110nnnnn - repeat last row n+1 (1-32) times
                value = byte1 % 32 + 1;

                // Next, copy the entire row.
                for (let x = 0; x < 1024; x++) {
                    for (let y = rowsCounted; y < rowsCounted + value; y++) {
                        tiles[x][y] = tiles[x][y - 1];
                    }
                }

                rowsCounted += value;

            } else if (b1check == ELVLRegionTileMapHandler.LONG_REPEAT) {

                // 111000nn nnnnnnnn - repeat last row n+1 (1-1024) times
                byte2 = buffer.readUInt8(offset++);
                value = 256 * (byte1 % 4) + byte2 + 1;

                // Next, copy the entire row.
                for (let x = 0; x < 1024; x++) {
                    for (let y = rowsCounted; y < rowsCounted + value; y++) {
                        tiles[x][y] = tiles[x][y - 1];
                    }
                }

                rowsCounted += value;

            } else {
                throw new Error("Error in region tile data: byte1/32 = " + b1check);
            }

            if (tilesInRow == 1024) {
                tilesInRow = 0;
                rowsCounted += 1;
            }
        }

        return new ELVLRegionTileData(tiles);
    }

    // @Override
    write(chunk: ELVLRegionTileData): Buffer {

        let buffer: Buffer;

        // TODO: Implement.

        return buffer;
    }
}

/**
 * The <i>ELVLRegionAutoWarpHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionAutoWarpHandler extends ELVLRegionChunkHandler<ELVLRegionAutoWarp> {

    constructor() {
        super('rAWP');
    }

    // @Override
    read(buffer: Buffer): ELVLRegionAutoWarp {

        let x: number;
        let y: number;
        let arena: string = null;

        x = buffer.readInt16LE(0);
        y = buffer.readInt16LE(2);

        if (buffer.length > 4) {
            arena = BufferUtils.readFixedString(buffer, 4, buffer.length - 4);
        }

        return new ELVLRegionAutoWarp(x, y, arena);
    }

    // @Override
    write(chunk: ELVLRegionAutoWarp): Buffer {

        chunk.validate();

        let arena = chunk.arena;
        let buffer: Buffer = Buffer.alloc(arena != null ? 4 + arena.length : 4);

        buffer.writeUInt16LE(chunk.x, 0);
        buffer.writeUInt16LE(chunk.y, 2);

        if (arena != null) {
            BufferUtils.writeFixedString(buffer, arena, 4);
        }

        return buffer;
    }
}

// #############################
// ## HANDLER ASSIGNMENT CODE ##
// #############################

ELVL.handlers['ATTR'] = new ELVLAttributeHandler();
ELVL.handlers['REGN'] = new ELVLRegionHandler();
ELVL.handlers['DCWT'] = new ELVLWallTilesHandler();
ELVL.handlers['DCTT'] = new ELVLTextTilesHandler();
ELVL.handlers['DCID'] = new ELVLHashCodeHandler();
ELVL.handlers['DCBM'] = new ELVLBookmarksHandler();
ELVL.handlers['DCLV'] = new ELVLLVZPathHandler();

ELVLRegionHandler.handlers['rTIL'] = new ELVLRegionTileMapHandler();
ELVLRegionHandler.handlers['rAWP'] = new ELVLRegionAutoWarpHandler();
