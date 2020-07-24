import { Zip } from '../../../io/Zip';
import { LibraryAsset, LibraryAssetLoader } from './Library';

/**
 * The <i>Stamp</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Stamp extends LibraryAsset {

  /**
   * @constructor
   *
   * @param {string} id
   * @param {string} name
   */
  constructor(id: string = null, name: string) {
    super('stamp', id, name);
  }

  /** @override */
  protected onLoad(json: { [field: string]: any }, libraryZip: Zip): void {
  }

  /** @override */
  protected onSave(json: { [field: string]: any }, libraryZip: Zip): void {
  }

  /** @override */
  protected onPreUpdate(): void {
  }

  /** @override */
  protected onUpdate(): void {
  }

  /** @override */
  protected onPostUpdate(): void {
  }
}

/**
 * The <i>StampLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
export class StampLoader extends LibraryAssetLoader {

  /** @override */
  onLoad(id: string, json: { [p: string]: any }, projectZip: Zip): Stamp {
    let asset = new Stamp(id, json.name);
    asset.load(json, projectZip);
    return asset;
  }
}

LibraryAssetLoader.set('stamp', new StampLoader());
