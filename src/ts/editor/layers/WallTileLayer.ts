import GeneratedLayer from './GeneratedLayer';
import LayerManager from './LayerManager';
import TileData from '../../util/map/TileData';
import { Zip } from '../../io/Zip';

/**
 * The <i>WallTileLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class WallTileLayer extends GeneratedLayer {
  private wallTileData: TileData[];
  private idToValueMap: { [id: string]: number };
  private valueToIdMap: { [value: number]: string };

  /**
   * @param {LayerManager} manager
   * @param {string} id
   * @param {string} name
   */
  constructor(manager: LayerManager, id: string, name: string) {
    super('walltile', id, name);
  }

  /** @override */
  onLoad(json: { [p: string]: any }, projectZip: Zip): void {
  }

  /** @override */
  onSave(json: { [p: string]: any }, projectZip: Zip): void {
  }

  /** @override */
  protected onGenerate(): void {
  }

  /** @override */
  protected onCacheApply(): void {
  }
}
