import { Zip } from '../../../io/Zip';
import LibraryAsset from './LibraryAsset';

/**
 * The <i>LibraryAssetLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
abstract class LibraryAssetLoader {
  static readonly loaders: { [type: string]: LibraryAssetLoader } = {};

  /**
   * @param {string} id
   * @param {[field: string]: any} json
   * @param {Zip} projectZip
   */
  abstract onLoad(id: string, json: { [field: string]: any }, projectZip: Zip): LibraryAsset;

  /**
   * @param {string} type
   */
  static get(type: string): LibraryAssetLoader {
    return LibraryAssetLoader.loaders[type];
  }

  /**
   * @param {string} type
   * @param {LibraryAssetLoader} loader
   */
  static set(type: string, loader: LibraryAssetLoader): void {
    LibraryAssetLoader.loaders[type] = loader;
  }

  static test() {
    // let library = new Library(null, 'test');
    // library.set(new Sprite(null, 'test'));
    // library.toBuffer((buffer) => {
    //   const fs = require('fs');
    //   const dir = process.env.HOMEDRIVE + process.env.HOMEPATH + '/SubSpaceWorkshop/';
    //   if (!fs.existsSync(dir)) {
    //     fs.mkdirSync(dir);
    //   }
    //   const libDir = dir + '/Libraries/';
    //   if (!fs.existsSync(libDir)) {
    //     fs.mkdirSync(libDir);
    //   }
    //   fs.writeFileSync(libDir + 'test.sswl', buffer);
    // });
  }
}

export default LibraryAssetLoader;
