import { DEFAULT_TILESET, LVLTileSet } from '../LVL';
import Dirtable from '../../util/Dirtable';
import TileData  from '../../util/map/TileData';
import MapArea from '../../util/map/MapArea';
import ELVLCollection from './elvl/ELVLCollection';

/**
 * The <i>LVLMap</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class LVLMap implements Dirtable {
  readonly tiles: TileData;
  tileset: LVLTileSet;
  metadata: ELVLCollection;
  name: string;
  private dirty: boolean;

  /**
   * @param name {string} The name of the map.
   * @param tiles {TileData} The tiles placed in the map.
   * @param tileSet {LVLTileSet} The tileset used by the map.
   * @param metadata {ELVLCollection} The ELVL metadata stored with the map file.
   */
  public constructor(
    name: string,
    tiles: TileData = null,
    tileSet: LVLTileSet = DEFAULT_TILESET,
    metadata: ELVLCollection = new ELVLCollection()
  ) {

    this.name = name;
    this.tileset = tileSet;
    this.metadata = metadata;

    if (tiles == null) {
      tiles = new TileData();
    }
    this.tiles = tiles;
  }

  getMetadata(): ELVLCollection {
    return this.metadata;
  }

  /** @override */
  public isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  public setDirty(flag: boolean, area: MapArea = null): void {
    if (flag != this.dirty) {
      this.dirty = flag;
      this.tiles.setDirty(flag, area);
    }
  }
}
