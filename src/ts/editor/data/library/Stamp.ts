import { Zip } from '../../../io/Zip';
import LibraryAsset from './LibraryAsset';

/**
 * The <i>Stamp</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class Stamp extends LibraryAsset {

  /**
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
