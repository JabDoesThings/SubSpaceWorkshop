import uuid = require('uuid');
import { Dirtable } from '../../../util/Dirtable';
import { Zip } from '../../../io/Zip';

/**
 * The <i>Library</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Library implements Dirtable {

  private readonly metadata: { [id: string]: any };
  private readonly assets: { [id: string]: LibraryAsset };
  private readonly id: string;

  private name: string;
  private dirty: boolean;

  /**
   * Main constructor
   *
   * @param id
   * @param name
   */
  constructor(id: string = null, name: string) {
    if (name == null) {
      throw new Error("The name given is null or undefined.");
    }
    if (id == null) {
      id = uuid.v4();
    }

    this.id = id;
    this.name = name;
    this.assets = {};
    this.metadata = {};
    this.dirty = true;
  }

  private load(json: { [field: string]: any }, zip: Zip): void {
    const assets: { [id: string]: any } = json.assets;
    for (let id in assets) {
      const next = assets[id];
      if (next.name == null) {
        throw new Error('The asset does not have a defined name. (id: ' + id + ")");
      }
      if (next.type == null) {
        throw new Error('The asset does not have a defined type. (id: ' + id + ", name: " + next.name + ")");
      }

      const loader = LibraryAssetLoader.get(next.type);
      if (loader == null) {
        throw new Error(
          'There are no registered loaders for the type: \''
          + next.type
          + '\' (id: '
          + id
          + ', name: '
          + next.name
          + ')'
        );
      }
      try {
        this.assets[id] = loader.onLoad(next.id, next, zip);
      } catch (e) {
        console.error(
          'Failed to load asset. (type: '
          + next.type
          + ', id: '
          + id
          + ', name: '
          + next.name
          + ')'
        );
        throw e;
      }
    }
    this.setDirty(true);
  }

  save(path: string): void {
    if (path == null) {
      throw new Error('The path given is null or undefined.');
    }

    const zip = new Zip();
    const json: { [field: string]: any } = {};

    json.id = this.id;
    json.name = this.name;
    json.assets = {};

    for (let id in this.assets) {
      const next = this.assets[id];
      try {
        next.save(next, zip);
      } catch (e) {
        console.error('Failed to save asset: {id: ' + next.getId() + ', name: ' + next.getName() + '}');
        console.error(e);
      }
    }

    zip.set('library.json', JSON.stringify(json, null, 2));
    zip.write(path);
  }

  toBuffer(onSuccess: (buffer: Buffer) => void): void {
    const zip = new Zip();
    const json: { [field: string]: any } = {};

    json.id = this.id;
    json.name = this.name;
    json.assets = {};

    for (let id in this.assets) {
      const next = this.assets[id];
      try {
        next.save(next, zip);
      } catch (e) {
        console.error(`Failed to save asset: {id: ${next.getId()}, name: ${next.getName()}}`);
        console.error(e);
      }
    }

    zip.set('library.json', JSON.stringify(json, null, 2));
    zip.toBuffer(null, onSuccess);
  }

  set(asset: LibraryAsset): void {
    this.assets[asset.getId()] = asset;
  }

  getMetadata(id: string): any {
    return this.metadata[id];
  }

  setMetadata(id: string, value: any): void {
    this.metadata[id] = value;
  }

  getMetadataTable(): { [id: string]: any } {
    return this.metadata;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    if (name === this.name) {
      return;
    }
    this.name = name;
    this.setDirty(true);
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  static read(path: string | Buffer, onSuccess: (library: Library) => void, onError: (error: Error) => void): void {
    if (path == null) {
      throw new Error('The path (or buffer), provided is null or undefined.');
    }
    if (onSuccess == null) {
      throw new Error('The \'onSuccess(library: Library)\' function provided is null or undefined.');
    }
    if (onError == null) {
      throw new Error('The \'onError(error: Error)\' function provided is null or undefined.');
    }

    const error = (message: string): void => {
      const _error = new Error(message);
      onError(_error);
      throw _error;
    };

    const zip = new Zip();
    zip.read(path, () => {
      if (!zip.exists('library.json')) {
        if (typeof path === 'string') {
          throw new Error('The file \'library.json\' does not exist in: ' + path);
        } else {
          throw new Error('The file \'library.json\' does not exist in library buffer.');
        }
      }
      const json = JSON.parse(zip.get('library.json').toString());
      if (json.id == null) {
        error('The library.json does not have a defined ID.');
      }
      if (json.name == null) {
        error('The library.json does not have a defined name.');
      }
      if (json.assets == null) {
        error('The library.json does not have a defined assets section.');
      }
      try {
        const library = new Library(json.id, json.name);
        library.load(json, zip);
        onSuccess(library);
      } catch (e) {
        console.error('Failed to load library. (id: ' + json.id + ', name: ' + json.name + ')');
        error(e);
      }
    }, (error: Error) => {
      throw error;
    });
  }
}

/**
 * The <i>LibraryAsset</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class LibraryAsset {

  private readonly metadata: { [id: string]: any };
  private readonly id: string;
  private readonly type: string;

  private name: string;
  private dirty: boolean;

  /**
   * @constructor
   *
   * @param {string} type
   * @param {string} id
   * @param {string} name
   */
  protected constructor(type: string, id: string = null, name: string) {
    if (type == null) {
      throw new Error('The id given is null or undefined.');
    }
    if (name == null) {
      throw new Error('The name given is null or undefined.');
    }
    if (id == null) {
      id = uuid.v4();
    }
    this.type = type;
    this.id = id;
    this.name = name;
    this.metadata = {};
    this.dirty = true;
  }

  /**
   * @param {[field: string]: any} json
   * @param {Zip} libraryZip
   */
  load(json: { [field: string]: any }, libraryZip: Zip): void {
    this.onLoad(json, libraryZip);
    this.setDirty(true);
  }

  /**
   * @param {[field: string]: any} json
   * @param {Zip} libraryZip
   */
  save(json: { [field: string]: any }, libraryZip: Zip): void {
    json.type = this.type;
    json.name = this.name;
    this.onSave(json, libraryZip);
  }

  preUpdate(): void {
    try {
      this.onPreUpdate();
    } catch (e) {
      console.error(
        `Failed to preUpdate() for LibraryAsset. (id: ${this.getId()}, name: ${this.getName()})`
      );
    }
  }

  update(): void {
    try {
      this.onUpdate();
    } catch (e) {
      console.error(
        `Failed to update() for LibraryAsset. (id: ${this.getId()}, name: ${this.getName()})`
      );
    }
  }

  postUpdate(): void {
    try {
      this.onPostUpdate();
    } catch (e) {
      console.error(
        `Failed to postUpdate() for LibraryAsset. (id: ${this.getId()}, name: ${this.getName()})`
      );
    }
    this.setDirty(false);
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    if (name == null) {
      throw new Error('The name given is null or undefined.');
    }
    if (this.name === name) {
      return;
    }
    this.name = name;
    this.setDirty(true);
  }

  getType(): string {
    return this.type;
  }

  getId(): string {
    return this.id;
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  getMetadata(id: string): any {
    return this.metadata[id];
  }

  setMetadata(id: string, value: any): void {
    this.metadata[id] = value;
  }

  getMetadataTable(): { [id: string]: any } {
    return this.metadata;
  }

  protected abstract onPreUpdate(): void;

  protected abstract onUpdate(): void;

  protected abstract onPostUpdate(): void;

  /**
   * @param {[field: string]: any} json
   * @param {Zip} libraryZip
   */
  protected abstract onLoad(json: { [field: string]: any }, libraryZip: Zip): void;

  /**
   * @param {[field: string]: any} json
   * @param {Zip} libraryZip
   */
  protected abstract onSave(json: { [field: string]: any }, libraryZip: Zip): void;
}

/**
 * The <i>LibraryAssetLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class LibraryAssetLoader {

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
}
