import ELVLRegionChunk from './ELVLRegionChunk';
import ELVLChunk from '../ELVLChunk';
import ELVLRegionTileData from './ELVLRegionTileData';
import ELVLRegionAutoWarp from './ELVLRegionAutoWarp';
import ELVLRegionOptions from '../../ELVLRegionOptions';
import { DEFAULT_REGION_OPTIONS } from '../../ELVLUtils';

/**
 * The <i>ELVLRegion</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLRegion extends ELVLChunk {
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
        isFlagBase: DEFAULT_REGION_OPTIONS.isFlagBase,
        noAntiWarp: DEFAULT_REGION_OPTIONS.noAntiWarp,
        noWeapons: DEFAULT_REGION_OPTIONS.noWeapons,
        noFlagDrops: DEFAULT_REGION_OPTIONS.noFlagDrops
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
