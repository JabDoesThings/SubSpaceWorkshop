import { Zip } from '../../../io/Zip';
import LibraryAsset from './LibraryAsset';
import LibraryAssetLoader from './LibraryAssetLoader';

/**
 * The <i>Sprite</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class Sprite extends LibraryAsset {

  /**
   * @param {string} id
   * @param {string} name
   */
  constructor(id: string = null, name: string) {
    super('sprite', id, name);
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
 * The <i>SpriteLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SpriteLoader extends LibraryAssetLoader {

  /** @override */
  onLoad(id: string, json: { [p: string]: any }, projectZip: Zip): Sprite {
    let asset = new Sprite(id, json.name);
    asset.load(json, projectZip);
    return asset;
  }
}

LibraryAssetLoader.set('sprite', new SpriteLoader());
