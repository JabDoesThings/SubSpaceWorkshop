import { Zip } from '../../../io/Zip';
import LibraryAssetLoader from './LibraryAssetLoader';
import Stamp from './Stamp';

/**
 * The <i>StampLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class StampLoader extends LibraryAssetLoader {

  /** @override */
  onLoad(id: string, json: { [p: string]: any }, projectZip: Zip): Stamp {
    let asset = new Stamp(id, json.name);
    asset.load(json, projectZip);
    return asset;
  }
}

LibraryAssetLoader.set('stamp', new StampLoader());
