import { BufferUtils } from '../../util/BufferUtils';
import { ELVL } from './ELVLUtils';

export class ELVLCollection {

    readonly chunks: ELVLChunk[];

    constructor() {
        this.chunks = [];
    }

    hasChunk(chunk: ELVLChunk): boolean {

        if (chunk == null) {
            throw new Error("The ELVLchunk given is null or undefined.");
        }

        for (let index = 0; index < this.chunks.length; index++) {
            let next = this.chunks[index];
            if (chunk.equals(next)) {
                return true;
            }
        }
    }

    addChunk(chunk: ELVLChunk) {

        if (chunk == null) {
            throw new Error("The chunk given is null or undefined.");
        } else if (this.hasChunk(chunk)) {
            throw new Error("The chunk is already in the collection.");
        }

        this.chunks.push(chunk);
    }
}

export abstract class ELVLChunk {

    readonly type: ELVLChunkType;

    protected constructor(type: ELVLChunkType) {
        this.type = type;
    }

    abstract write(): Buffer;

    static writeHeader(buffer: Buffer, header: number, length: number) {
        buffer.writeUInt32LE(header, 0);
        buffer.writeUInt32LE(length, 4);
    }

    abstract equals(next: any): boolean;

    abstract validate(): void;
}

/**
 * The <i>ELVLRawChunk</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRawChunk extends ELVLChunk {

    data: Buffer;

    constructor(type: number, data: Buffer) {
        super(type);
        this.data = data;
    }

    // @Override
    equals(next: any): boolean {

        if (next == null || !(next instanceof ELVLRawChunk)) {
            return false;
        }

        return next === this;
    }

    // @Override
    validate(): void {

        if (this.type == null) {
            throw new Error("The 'type' field of the ELVLRawChunk is null or undefined.");
        } else if (this.data == null) {
            throw new Error("The 'data' field of the ELVLRawChunk is null or undefined.");
        }
    }

    // @Override
    write(): Buffer {
        // TODO: Document.
        return undefined;
    }
}

export class ELVLAttribute extends ELVLChunk {

    name: string;
    value: string;

    constructor(name: string, value: string) {
        super(ELVLChunkType.ATTRIBUTE);

        this.name = name;
        this.value = value;

        this.validate();
    }

    equals(next: any): boolean {

        if (next == null || !(next instanceof ELVLAttribute)) {
            return false;
        }

        return next.name == this.name && next.value == this.value;
    }

    // @Override
    validate(): void {

        if (this.name == null) {
            throw new Error("The 'name' field of the ELVLAttribute is null or undefined.");
        } else if (this.value == null) {
            throw new Error("The 'value' field of the ELVLAttribute '" + this.name + "' is null or undefined.");
        }
    }

    write(): Buffer {
        // TODO: Implement.
        return undefined;
    }
}

/**
 * The <i>ELVLRegion</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegion extends ELVLChunk {

    unknowns: ELVLRegionRawChunk[];
    tileData: ELVLRegionTileData;
    autoWarp: ELVLRegionAutoWarp;
    options: ELVLRegionOptions;
    name: string;
    pythonCode: string;

    constructor(
        name: string,
        options: ELVLRegionOptions = null,
        tileData: ELVLRegionTileData = new ELVLRegionTileData(),
        autoWarp: ELVLRegionAutoWarp = null,
        pythonCode: string = null,
        unknowns: ELVLRegionRawChunk[] = []
    ) {

        super(ELVLChunkType.REGION);

        this.name = name;
        this.tileData = tileData;
        this.autoWarp = autoWarp;
        this.pythonCode = pythonCode;
        this.unknowns = unknowns;

        // Clone DEFAULT_REGION_OPTIONS.
        if (options == null) {
            options = {
                isFlagBase: ELVL.DEFAULT_REGION_OPTIONS.isFlagBase,
                noAntiWarp: ELVL.DEFAULT_REGION_OPTIONS.noAntiWarp,
                noWeapons: ELVL.DEFAULT_REGION_OPTIONS.noWeapons,
                noFlagDrops: ELVL.DEFAULT_REGION_OPTIONS.noFlagDrops
            };
        }

        this.options = options;

        this.validate();
    }

    // @Override
    equals(next: any): boolean {

        if (next == null || !(next instanceof ELVLRegion)) {
            return false;
        }

        return next.type === this.type && next.name === this.name;
    }

    // @Override
    validate(): void {

        if (this.name == null) {
            throw new Error("The 'name' field for the ELVLRegion is null or undefined.");
        } else if (this.options == null) {
            throw new Error("The 'options' field for the ELVLRegion '" + this.name + "' is null or undefined.");
        } else if (this.options.noAntiWarp == null) {
            throw new Error("The 'noAntiWarp' options field for the ELVLRegion '" + this.name + "' is null or undefined.");
        } else if (this.options.noWeapons == null) {
            throw new Error("The 'noWeapons' options field for the ELVLRegion '" + this.name + "' is null or undefined.");
        } else if (this.options.noFlagDrops == null) {
            throw new Error("The 'noFlagDrops' options field for the ELVLRegion '" + this.name + "' is null or undefined.");
        } else if (this.options.isFlagBase == null) {
            throw new Error("The 'isFlagBase' options field for the ELVLRegion '" + this.name + "' is null or undefined.");
        }

        if (this.autoWarp != null) {
            this.autoWarp.validate(this.name);
        }

        if (this.tileData != null) {
            this.tileData.validate(this.name);
        }
    }

    // @Override
    write(): Buffer {
        return undefined;
    }
}

export interface ELVLRegionOptions {
    isFlagBase: boolean;
    noAntiWarp: boolean;
    noWeapons: boolean;
    noFlagDrops: boolean;
}

export class ELVLRegionRawChunk {

    type: number;
    data: Buffer;

    constructor(type: number, data: Buffer) {
        this.type = type;
        this.data = data;
    }

    // @Override
    equals(other: any): boolean {

        if (other == null || !(other instanceof ELVLRegionRawChunk)) {
            return false;
        }

        return other === this;
    }
}

/**
 * The <i>ELVLRegionTileData<i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionTileData {

    readonly tiles: number[][];

    constructor(tiles: number[][] = null) {

        if (tiles == null) {

            // Create a new blank array.
            tiles = new Array(1024);
            for (let x = 0; x < 1024; x++) {
                tiles[x] = new Array(1024);
                for (let y = 0; y < 1024; y++) {
                    tiles[x][y] = 0;
                }
            }
        }
        this.tiles = tiles;
        this.validate();
    }

    validate(regionName: string = null): void {
        // TODO: Implement.
    }

    write(): Buffer {

        // TODO: Implement.

        let length = 0;
        let buffer = Buffer.alloc(length);
        return buffer;
    }
}

/**
 * The <i>ELVLRegionAutoWarp<i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionAutoWarp {

    x: number;
    y: number;
    arena: string;

    /**
     * Main constructor.
     *
     * @param x The 'x' coordinate to warp a player. If set to -1, this will be the player's current 'x' coordinate.
     * If set to 0, the 'x' coordinate will be the player's spawn 'x' coordinate. If set to 1-1023, this will be the
     * coordinate to warp to.
     *
     *  @param y The 'y' coordinate to warp a player. If set to -1, this will be the player's current 'y' coordinate.
     * If set to 0, the 'y' coordinate will be the player's spawn 'y' coordinate. If set to 1-1023, this will be the
     * coordinate to warp to.
     *
     * @param arena The arena name to warp to. Set to null not warp to a different arena.
     */
    constructor(x: number, y: number, arena: string = null) {

        this.x = x;
        this.y = y;
        this.arena = arena;

        this.validate();
    }

    validate(regionName: string = null): void {

        if (this.x < -1) {
            throw new Error("The 'x' value given is less than -1. (" + this.x + " given)");
        } else if (this.x > 1023) {
            throw new Error("The 'x' value given is greater than 1023. (" + this.x + " given)");
        }

        if (this.y < -1) {
            throw new Error("The 'y' value given is less than -1. (" + this.y + " given)");
        } else if (this.y > 1023) {
            throw new Error("The 'y' value given is greater than 1023. (" + this.y + " given)");
        }

        if (this.arena != null) {
            if (this.arena.length > 16) {
                throw new Error("The 'arena' string given is longer than 16 characters.");
            }
        }
    }

    write(): Buffer {

        // NOTE: As a simple space optimization, if the warp does not cross arenas, you can
        // leave out the 16 bytes of arena name, so that the whole chunk data is 4 bytes
        // long.

        this.validate();

        let length;
        if (this.arena == null) {
            length = 4;
        } else {
            length = 20;
        }

        let buffer: Buffer = Buffer.alloc(8 + length);

        // SUB-CHUNK HEADER.
        ELVLChunk.writeHeader(buffer, ELVLRegionType.REGION_AUTO_WARP, length);

        buffer.writeUInt16LE(this.x, 4);
        buffer.writeUInt16LE(this.y, 6);

        if (this.arena != null) {
            for (let index = 0; index < this.arena.length; index++) {
                BufferUtils.writeFixedString(buffer, this.arena, 8);
            }
        }

        return buffer;
    }

}

/**
 * The <i>ELVLType</i> enum identifies chunk types for ELVL data.
 * <ul>
 *     <li><b>ATTRIBUTE</b><p>
 *     These define misc textual attributes. the format is ascii text, not null terminated,
 *     in this form: "<key>=<value>". each "ATTR" chunk should contain just one key/value
 *     pair. multiple chunks of this type may be present in one file.
 *
 *     <li><b>REGION</b><p>
 *     These chunks define regions. to recap, a region is a set of tiles, usually but not
 *     always contiguous, with certain properties. asss understands regions and can
 *     implement some advanced features using them. currently continuum doesn't understand
 *     regions, but it would be nice if it did, and we'll be able to do even cooler things
 *     when it does.<p>

 *     There's a lot of stuff that you might want to say about a region, so to support all
 *     the varied uses, and also future uses, we'll use the chunk model again: each region
 *     gets its own set of "subchunks" describing its function. to avoid confusion, all
 *     sub-chunk types that go inside the "REGN" superchunk start with "r". the data of
 *     the big "REGN" chunk is simply a series of subchunks.
 * </ul>
 */
export enum ELVLChunkType {
    ATTRIBUTE = 1381258305 /*ATTR*/,
    REGION = 1313293650 /*REGN*/,
    TILESET = 1413829460 /*TSET*/,
    TILE = 1162627412 /*TILE*/
}

/**
 * The <i>ELVLRegionType</i> enum identifies REGION sub-chunk types.
 *
 * <ul>
 *     <li><b>REGION_NAME</b><p>
 *     This is just a plain ascii string, not null terminated. every chunk should have
 *     exactly one of these.
 *
 *     <li><b>REGION_TILE_DATA</b><p>
 *     This sub-chunk describes the tiles that make up the region. it's stored in a
 *     compact RLE-ish representation.
 *
 *     Conceptually, a region is some subset of the 1024x1024 tiles in the map. to encode a
 *     region, encode it row by row, left to right, top to bottom.
 *
 *     <li><b>REGION_BASE_FLAG</b><p>
 *     This is a 0-byte chunk. its presence signifies that this region should be considered
 *     a "base".
 *
 *     <li><b>REGION_NO_ANTIWARP</b><p>
 *     This is a 0-byte chunk. If present, antiwarp should be disabled for ships in this
 *     region. This happens on the server and players whose antiwarp is being disabled
 *     aren't necessarily aware of it.
 *
 *     <li><b>REGION_NO_WEAPONS</b><p>
 *     This is a 0-byte chunk. If present, all weapons are non-functional in this region.
 *     This happens on the server and players whose weapons are being disabled aren't
 *     necessarily aware of it.
 *
 *     <li><b>REGION_NO_FLAG_DROPS</b><p>
 *     This is a 0-byte chunk. If present, any flags dropped in this region are respawned
 *     as neutral flags in the center of the map. (or wherever the settings indicate they
 *     should be spawned)
 *
 *     <li><b>REGION_AUTO_WARP</b><p>
 *     This chunk, if present, turns on the auto-warping feature. any player entering this
 *     region will be immediately warped to the specified destination.
 *
 *     <li><b>REGION_PYTHON_CODE</b><p>
 *     This chunk lets you embed code in level files. the exact semantics of this data
 *     haven't yet been determined, but it'll probably go something like this:<p>
 *
 *     This chunk should contain ascii data representing some python code. the code will
 *     be executed when the map is loaded, and it may define several functions: a function
 *     named "enter", if it exists, will be call each time a player enters this region. it
 *     will be called with one argument, which is the player who entered the region. a
 *     function named "exit" works similarly, except of course it gets called when someone
 *     leaves.
 * </ul>
 */
export enum ELVLRegionType {
    REGION_NAME = 1296125554 /*rNAM*/,
    REGION_TILE_DATA = 1279874162 /*rTIL*/,
    REGION_BASE_FLAG = 1163084402 /*rBSE*/,
    REGION_NO_ANTIWARP = 1463897714 /*rNAW*/,
    REGION_NO_WEAPONS = 1347898994 /*rNWP*/,
    REGION_NO_FLAG_DROPS = 1279676018 /*rNFL*/,
    REGION_AUTO_WARP = 1347895666 /*rAWP*/,
    REGION_PYTHON_CODE = 1129926770 /*rPYC*/
}
