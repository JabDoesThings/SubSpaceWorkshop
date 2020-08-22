import uuid = require('uuid');
import { Zip } from '../../../io/Zip';

/**
 * The <i>LibraryAsset</i> class. TODO: Document.
 *
 * @author Jab
 */
abstract class LibraryAsset {
  private readonly metadata: { [id: string]: any };
  private readonly id: string;
  private readonly type: string;
  private name: string;
  private dirty: boolean;

  /**
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

export default LibraryAsset;
