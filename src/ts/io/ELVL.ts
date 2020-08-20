import { ELVL } from './ELVLUtils';

/**
 * The <i>ELVLChunk</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class ELVLChunk {
  readonly id: string;

  /**
   * @constructor
   *
   * @param {string} id
   */
  protected constructor(id: string) {
    this.id = id;
  }

  abstract equals(next: any): boolean;

  abstract validate(): void;
}

/**
 * The <i>ELVLRegionChunk</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class ELVLRegionChunk {
  readonly id: string;

  /**
   * @constructor
   *
   * @param {string} id
   */
  protected constructor(id: string) {
    this.id = id;
  }
}

/**
 * The <i>ELVLCollection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLCollection {
  readonly chunks: ELVLChunk[];
  readonly regions: ELVLRegion[];
  readonly attributes: ELVLAttribute[];

  /** @constructor */
  constructor() {
    this.chunks = [];
    this.regions = [];
    this.attributes = [];
  }

  addChunk(chunk: ELVLChunk): void {
    if (chunk == null) {
      throw new Error('The ELVLChunk is null or undefined.');
    } else if (this.hasChunk(chunk)) {
      throw new Error('The ELVLChunk is already in the collection.');
    }
    this.chunks.push(chunk);
  }

  addRegion(region: ELVLRegion): void {
    if (region == null) {
      throw new Error('The ELVLRegion is null or undefined.');
    } else if (this.hasRegion(region)) {
      throw new Error('The ELVLRegion is already in the collection.');
    }
    this.regions.push(region);
  }

  hasChunk(chunk: ELVLChunk): boolean {
    if (chunk == null) {
      throw new Error('The ELVL chunk given is null or undefined.');
    }
    for (let index = 0; index < this.chunks.length; index++) {
      const next = this.chunks[index];
      if (chunk.equals(next)) {
        return true;
      }
    }
    return false;
  }

  hasAttribute(attribute: ELVLAttribute): boolean {
    if (attribute == null) {
      throw new Error('The ELVLAttribute is null or undefined.');
    }
    for (let index = 0; index < this.chunks.length; index++) {
      const next = this.chunks[index];
      if (attribute.equals(next)) {
        return true;
      }
    }
    return false;
  }

  hasRegion(region: ELVLRegion): boolean {
    if (region == null) {
      throw new Error('The ELVLRegion is null or undefined.');
    }
    for (let index = 0; index < this.chunks.length; index++) {
      const next = this.chunks[index];
      if (region.equals(next)) {
        return true;
      }
    }
    return false;
  }

  addAttribute(attribute: ELVLAttribute): void {
    if (attribute == null) {
      throw new Error('The ELVLAttribute is null or undefined.');
    } else if (this.hasAttribute(attribute)) {
      throw new Error('The ELVLAttribute is already in the collection.');
    }
    this.attributes.push(attribute);
  }

  getAttributes(): ELVLAttribute[] {
    return this.attributes;
  }

  getRegions(): ELVLRegion[] {
    return this.regions;
  }

  getChunks(): ELVLChunk[] {
    return this.chunks;
  }
}

/**
 * The <i>ELVLRawChunk</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRawChunk extends ELVLChunk {
  data: Buffer;

  /**
   * @constructor
   *
   * @param {string} id
   * @param {Buffer} data
   */
  constructor(id: string, data: Buffer) {
    super(id);
    this.data = data;
  }

  /** @override */
  equals(next: any): boolean {
    if (next == null || !(next instanceof ELVLRawChunk)) {
      return false;
    }
    return next === this;
  }

  /** @override */
  validate(): void {
    if (this.data == null) {
      throw new Error('The "data" field of the ELVLRawChunk is null or undefined.');
    }
  }
}

/**
 * The <i>ELVLAttribute</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLAttribute extends ELVLChunk {
  name: string;
  value: string;

  /**
   * @constructor
   *
   * @param {string} name
   * @param {string} value
   */
  constructor(name: string, value: string) {
    super('ATTR');
    this.name = name;
    this.value = value;
    this.validate();
  }

  /** @override */
  equals(next: any): boolean {
    if (next == null || !(next instanceof ELVLAttribute)) {
      return false;
    }
    return next.id == this.id && next.name == this.name && next.value == this.value;
  }

  /** @override */
  validate(): void {
    if (this.name == null) {
      throw new Error("The 'name' field of the ELVLAttribute is null or undefined.");
    } else if (this.value == null) {
      throw new Error("The 'value' field of the ELVLAttribute '" + this.name + "' is null or undefined.");
    }
  }
}

/**
 * The <i>ELVLRegion</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegion extends ELVLChunk {
  chunks: ELVLRegionChunk[];
  tileData: ELVLRegionTileData;
  autoWarp: ELVLRegionAutoWarp;
  options: ELVLRegionOptions;
  color: number[];
  name: string;
  pythonCode: string;

  /**
   * @constructor
   *
   * @param {string} name
   * @param {ELVLRegionOptions} options
   * @param {ELVLRegionTileData} tileData
   * @param {ELVLRegionAutoWarp} autoWarp
   * @param {string} pythonCode
   * @param {ELVLRegionChunk} chunks
   */
  constructor(
    name: string,
    options: ELVLRegionOptions = null,
    tileData: ELVLRegionTileData = new ELVLRegionTileData(),
    autoWarp: ELVLRegionAutoWarp = null,
    pythonCode: string = null,
    chunks: ELVLRegionChunk[] = []
  ) {
    super('REGN');
    this.name = name;
    this.tileData = tileData;
    this.autoWarp = autoWarp;
    this.pythonCode = pythonCode;
    this.chunks = chunks;
    this.color = [0, 0, 0];
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

  /** @override */
  equals(next: any): boolean {
    if (next == null || !(next instanceof ELVLRegion)) {
      return false;
    }
    return next.id === this.id && next.name === this.name;
  }

  /** @override */
  validate(): void {
    if (this.name == null) {
      throw new Error('The "name" field for the ELVLRegion is null or undefined.');
    } else if (this.options == null) {
      throw new Error(`The "options" field for the ELVLRegion '${this.name}' is null or undefined.`);
    } else if (this.options.noAntiWarp == null) {
      throw new Error(`The "noAntiWarp" options field for the ELVLRegion '${this.name}' is null or undefined.`);
    } else if (this.options.noWeapons == null) {
      throw new Error(`The "noWeapons" options field for the ELVLRegion '${this.name}' is null or undefined.`);
    } else if (this.options.noFlagDrops == null) {
      throw new Error(`The "noFlagDrops" options field for the ELVLRegion '${this.name}' is null or undefined.`);
    } else if (this.options.isFlagBase == null) {
      throw new Error(`The "isFlagBase" options field for the ELVLRegion '${this.name}' is null or undefined.`);
    }
    if (this.autoWarp != null) {
      this.autoWarp.validate();
    }
    if (this.tileData != null) {
      this.tileData.validate();
    }
  }
}

/**
 * The <i>ELVLRegionRawChunk</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionRawChunk extends ELVLRegionChunk {
  type: number;
  data: Buffer;

  /**
   * @constructor
   *
   * @param {string} id
   * @param {Buffer} data
   */
  constructor(id: string, data: Buffer) {
    super(id);
    this.data = data;
  }

  /** @override */
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
export class ELVLRegionTileData extends ELVLRegionChunk {
  readonly tiles: boolean[][];

  /**
   * @constructor
   *
   * @param {boolean[][]} tiles
   */
  constructor(tiles: boolean[][] = null) {
    super('rTIL');
    if (tiles == null) {
      // Create a new blank array.
      tiles = new Array(1024);
      for (let x = 0; x < 1024; x++) {
        tiles[x] = new Array(1024);
        for (let y = 0; y < 1024; y++) {
          tiles[x][y] = false;
        }
      }
    }
    this.tiles = tiles;
    this.validate();
  }

  /** @override */
  validate(): void {
    // TODO: Implement.
  }
}

/**
 * The <i>ELVLRegionAutoWarp<i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionAutoWarp extends ELVLRegionChunk {
  x: number;
  y: number;
  arena: string;

  /**
   * @constructor
   *
   * @param {number} x The 'x' coordinate to warp a player. If set to -1, this will be the player's current 'x'
   *   coordinate. If set to 0, the 'x' coordinate will be the player's spawn 'x' coordinate. If set to 1-1023, this
   *   will be the coordinate to warp to.
   *
   *  @param {number} y The 'y' coordinate to warp a player. If set to -1, this will be the player's current 'y'
   *   coordinate. If set to 0, the 'y' coordinate will be the player's spawn 'y' coordinate. If set to 1-1023, this
   *   will be the coordinate to warp to.
   *
   * @param {string} arena The arena name to warp to. Set to null not warp to a different arena.
   */
  constructor(x: number, y: number, arena: string = null) {
    super('rAWP');
    this.x = x;
    this.y = y;
    this.arena = arena;
    this.validate();
  }

  /** @override */
  validate(): void {
    if (this.x < -1) {
      throw new Error(`The "x" value given is less than -1. (${this.x} given)`);
    } else if (this.x > 1023) {
      throw new Error(`The "x" value given is greater than 1023. (${this.x} given)`);
    }
    if (this.y < -1) {
      throw new Error(`The "y" value given is less than -1. (${this.y} given)`);
    } else if (this.y > 1023) {
      throw new Error(`The "y" value given is greater than 1023. (${this.y} given)`);
    }
    if (this.arena != null) {
      if (this.arena.length > 16) {
        throw new Error('The "arena" string given is longer than 16 characters.');
      }
    }
  }
}

/**
 * The <i>ELVLWallTiles</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLWallTiles extends ELVLChunk {
  public static readonly TOP_LEFT_CORNER = 9;
  public static readonly TOP_JUNCTION = 13;
  public static readonly TOP_RIGHT_CORNER = 12;
  public static readonly LEFT_JUNCTION = 11;
  public static readonly CENTER = 15;
  public static readonly RIGHT_JUNCTION = 14;
  public static readonly BOTTOM_LEFT_CORNER = 3;
  public static readonly BOTTOM_JUNCTION = 7;
  public static readonly BOTTOM_RIGHT_CORNER = 6;
  public static readonly VERTICAL_TOP_CAP = 8;
  public static readonly VERTICAL = 10;
  public static readonly VERTICAL_BOTTOM_CAP = 2;
  public static readonly HORIZONTAL_LEFT_CAP = 1;
  public static readonly HORIZONTAL = 5;
  public static readonly HORIZONTAL_RIGHT_CAP = 4;
  public static readonly DOT = 0;

  tiles: number[];

  constructor(tiles: number[] = null) {
    super('DCWT');
    if (tiles == null) {
      tiles = new Array(16);
      for (let index = 0; index < 16; index++) {
        tiles[index] = 0;
      }
    }
    this.tiles = tiles;
  }

  getTile(index: number): number {
    if (index < 0) {
      throw new Error(`The "index" given is negative. (${index} given)`);
    } else if (index > 15) {
      throw new Error(`The "index" given is greater than 15. (${index} given)`);
    }
    return this.tiles[index];
  }

  setTile(index: number, tileId: number): void {
    if (index < 0) {
      throw new Error(`The "index" given is negative. (${index} given)`);
    } else if (index > 15) {
      throw new Error(`The "index" given is greater than 15. (${index} given)`);
    }
    if (tileId < 0) {
      throw new Error(`The "tileId" given is negative. (${tileId} given)`);
    } else if (tileId > 255) {
      throw new Error(`The "tileId" given is greater than 255. (${tileId} given)`);
    }
    this.tiles[index] = tileId;
  }

  unsetTile(index: number): void {
    this.setTile(index, 0);
  }

  /** @override */
  equals(next: any): boolean {
    // Make sure that this is a wall-tile definition.
    if (next == null || !(next instanceof ELVLWallTiles)) {
      return false;
    }
    // Check each wall-tile definition.
    for (let index = 0; index < 16; index++) {
      // If these don't match, there's a difference.
      if (next.tiles[index] !== this.tiles[index]) {
        return false;
      }
    }
    // These are both equal.
    return true;
  }

  /** @override */
  validate(): void {
    if (this.tiles == null) {
      throw new Error('The "tiles" array for the ELVLDCMEWallTile is null or undefined.');
    } else if (this.tiles.length !== 16) {
      throw new Error('The "tiles" array for the ELVLDCMEWallTile is not a size of 16 numbers.');
    } else {
      // Go through each tile index to make sure that it is a valid tile ID.
      for (let index = 0; index < 16; index++) {
        if (typeof this.tiles[index] !== 'number') {
          throw new Error(
            `The entry "tiles[${index}]" for the ELVLDCMEWallTile is not a number. (${this.tiles[index]} assigned)`
          );
        } else if (this.tiles[index] < 0) {
          throw new Error(
            `The entry "tiles[${index}]" for the ELVLDCMEWallTile is less than 0. (${this.tiles[index]} assigned)`
          );
        } else if (this.tiles[index] > 255) {
          throw new Error(
            `The entry "tiles[${index}]" for the ELVLDCMEWallTile is greater than 255. (${this.tiles[index]} assigned)`
          );
        }
      }
    }
  }
}

/**
 * The <i>ELVLTextTiles</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLTextTiles extends ELVLChunk {

  readonly charMap: number[];

  /**
   * @constructor
   *
   * @param {number[]} chars
   */
  constructor(chars: number[] = null) {
    super('DCTT');
    if (chars == null) {
      // Create a blank array for chars.
      chars = new Array(256);
      // Set all chars as not assigned.
      for (let index = 0; index > chars.length; index++) {
        chars[index] = 0;
      }
    }

    this.charMap = chars;
  }

  /** @override */
  equals(next: any): boolean {
    if (next == null || !(next instanceof ELVLTextTiles)) {
      return false;
    }
    for (let index = 0; index < this.charMap.length; index++) {
      if (next.charMap[index] !== this.charMap[index]) {
        return false;
      }
    }
    return true;
  }

  /** @override */
  validate(): void {
    if (this.charMap == null) {
      throw new Error('The "charMap" field for the ELVLDCMETextTiles is null or undefined.');
    } else if (this.charMap.length != 256) {
      throw new Error(
        `The "charMap" field for the ELVLDCMETextTiles is not 256 in size. (${this.charMap.length} in size)`
      );
    } else {
      for (let index = 0; index < this.charMap.length; index++) {
        const next = this.charMap[index];
        if (typeof next !== 'number') {
          throw new Error(`"charMap[${index}]" is not a number. (${next} assigned)`);
        } else if (next < 0) {
          throw new Error(`"charMap[${index}]" is negative. (${next} assigned)`);
        }
      }
    }
  }
}

/**
 * The <i>ELVLDCMEHashCode</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLHashCode extends ELVLChunk {

  hashCode: string;

  /**
   * @constructor
   *
   * @param {string} hashCode
   */
  constructor(hashCode: string) {
    super('DCID');
    if (hashCode == null) {
      throw new Error('The hashCode given is null or undefined.');
    }
    this.hashCode = hashCode;
  }

  /** @override */
  equals(next: any): boolean {
    if (next == null || !(next instanceof ELVLHashCode)) {
      return false;
    }
    return next.hashCode === this.hashCode;
  }

  /** @override */
  validate(): void {
    if (this.hashCode == null) {
      throw new Error('The "hashCode" field for the ELVLDCMEHashCode is null or undefined.');
    } else if (typeof this.hashCode !== 'string') {
      throw new Error(
        `The "hashCode" field for the ELVLDCMEHashCode is not a string. (${this.hashCode} assigned)`
      );
    }
  }
}

/**
 * The <i>ELVLBookmarks</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLBookmarks extends ELVLRawChunk {

  /**
   * @constructor
   *
   * @param {Buffer} data
   */
  constructor(data: Buffer) {
    super('DCBM', data);
  }
}

/**
 * The <i>ELVLLVZPath</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLLVZPath extends ELVLRawChunk {

  /**
   * @constructor
   *
   * @param {Buffer} data
   */
  constructor(data: Buffer) {
    super('DCLV', data);
  }
}

/**
 * The <i>ELVLRegionOptions</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface ELVLRegionOptions {
  isFlagBase: boolean;
  noAntiWarp: boolean;
  noWeapons: boolean;
  noFlagDrops: boolean;
}
