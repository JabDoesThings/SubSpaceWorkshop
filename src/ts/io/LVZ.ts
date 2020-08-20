import * as zlib from 'zlib';
import * as fs from 'fs';
import { Dirtable } from '../util/Dirtable';
import { Validatable } from '../util/Validatable';
import { LVZ, LVZErrorStatus } from './LVZUtils';
import { MapSprite } from '../editor/render/MapSprite';
import { MapArea } from '../util/map/MapArea';
import { CoordinateType } from '../util/map/CoordinateType';

const ACCEPTED_FORMATS = ['bm2', 'bmp', 'png', 'gif', 'jpg'];

/**
 * The <i>LVZCollection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZCollection implements Dirtable, Validatable {

  private mapObjects: LVZMapObject[];
  private screenObjects: LVZScreenObject[];
  private dirty: boolean;

  /** @constructor */
  public constructor() {
    this.mapObjects = [];
    this.screenObjects = [];
    this.dirty = true;
  }

  /**
   * @param {MapArea} area The boundaries to select & return map objects that intersect or are contained
   *   within.
   *
   * @return {LVZMapObject[]} Returns an array of map objects that intersect or are contained within the
   *   given area.
   */
  public getNearby(area: MapArea): LVZMapObject[] {
    if (area == null) {
      throw new Error('The MapArea given is null.');
    }
    if (area.type === CoordinateType.TILE) {
      area = area.asType(CoordinateType.PIXEL);
    }

    // Grab every object that sits inside the given range.
    const result: LVZMapObject[] = [];
    for (let index = 0; index < this.mapObjects.length; index++) {
      let next = this.mapObjects[index];
      let x = next.getX(), y = next.getX();
      if (x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2) {
        result.push(next);
      }
    }
    return result;
  }

  /** @return {LVZMapObject[]} Returns all map objects contained within the LVZ collection. */
  public getMapObjects(): LVZMapObject[] {
    return this.mapObjects;
  }

  /** @return {LVZMapObject[]} Returns all screen objects contained within the LVZ collection. */
  public getScreenObjects(): LVZScreenObject[] {
    return this.screenObjects;
  }

  /** @override */
  public validate(): void {
    for (let key in this.mapObjects) {
      let value = this.mapObjects[key];
      value.validate();
    }
    for (let key in this.screenObjects) {
      let value = this.screenObjects[key];
      value.validate();
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  /**
   * Adds a map object to the collection.
   *
   * @param {LVZMapObject} object The object to add to the collection.
   *
   * @throws {Error} Thrown if the LVZ collection already contains the object.
   */
  public addMapObject(object: LVZMapObject) {
    // Make sure the MapObject is not null or undefined.
    if (object == null) {
      throw new Error('The LVZMapObject given is null or undefined.');
    }
    // Check if the MapObject is already registered in the collection.
    if (this.hasMapObject(object)) {
      let message = 'The LVZCollection already contains the LVZMapObject.';
      console.log(message);
      throw new Error(message);
    }

    this.mapObjects.push(object);
    this.setDirty(true);
  }

  /**
   * Unregisters a map object from the LVZ collection.
   *
   * @param object The map object to remove.
   *
   * @throws Error Thrown if the map object given is null, undefined, or is not registered to the package.
   */
  public removeMapObject(object: LVZMapObject): void {
    // Make sure the map object isn't null or undefined.
    if (object == null) {
      throw new Error('The LVZMapObject given is null or undefined.');
    }
    // Make sure that the map object is registered to the package.
    if (!this.hasMapObject(object)) {
      let message = 'The LVZCollection does not contain the LVZMapObject.';
      console.log(message);
      throw new Error(message);
    }

    const newArray: LVZMapObject[] = [];
    let offset: number = 0;
    for (let index = 0; index < this.mapObjects.length; index++) {
      const next = this.mapObjects[index];
      if (next === object) {
        continue;
      }
      newArray[offset++] = next;
    }

    this.mapObjects = newArray;
    this.setDirty(true);
  }

  /**
   * Adds a screen object to the collection.
   *
   * @param {LVZScreenObject} object The object to add to the collection.
   *
   * @throws {Error} Thrown if the LVZ collection already contains the object.
   */
  public addScreenObject(object: LVZScreenObject) {
    // Make sure the screen object is not null or undefined.
    if (object == null) {
      throw new Error('The LVZScreenObject given is null or undefined.');
    }
    // Check if the screen object is already registered in the collection.
    if (this.hasScreenObject(object)) {
      let message = 'The LVZCollection already contains the LVZScreenObject.';
      console.log(message);
      throw new Error(message);
    }

    this.screenObjects.push(object);
    this.setDirty(true);
  }

  /**
   * Unregisters a screen object from the LVZ collection.
   *
   * @param {LVZScreenObject} object The screen object to remove.
   *
   * @throws {Error} Thrown if the screen object given is null, undefined, or is not registered to the package.
   */
  public removeScreenObject(object: LVZScreenObject): void {
    // Make sure the screen object isn't null or undefined.
    if (object == null) {
      throw new Error('The LVZScreenObject given is null or undefined.');
    }

    // Make sure that the screen object is registered to the package.
    if (!this.hasScreenObject(object)) {
      let message = 'The LVZCollection does not contain the LVZScreenObject.';
      console.log(message);
      throw new Error(message);
    }

    const newArray: LVZScreenObject[] = [];
    let offset: number = 0;
    for (let index = 0; index < this.screenObjects.length; index++) {
      const next = this.screenObjects[index];
      if (next === object) {
        continue;
      }
      newArray[offset++] = next;
    }

    this.screenObjects = newArray;
    this.setDirty(true);
  }

  /** Clears all registered map objects in the LVZ collection. */
  public clearMapObjects(): void {
    this.mapObjects = [];
    this.setDirty(true);
  }

  /** Clears all registered screen objects in the LVZ collection. */
  public clearScreenObjects(): void {
    this.screenObjects = [];
    this.setDirty(true);
  }

  /** Clears all registered objects in the LVZ collection. */
  public clear(): void {
    this.clearMapObjects();
    this.clearScreenObjects();
  }

  /**
   * Tests if a map object is registered in the package.
   *
   * @param object The map object to test.
   *
   * @return Returns 'true' if the map object is registered in the package.
   */
  public hasMapObject(object: LVZMapObject) {
    // Make sure the map object isn't null or undefined.
    if (object == null) {
      throw new Error('The LVZMapObject given is null or undefined.');
    }
    // Make sure we have registered map objects.
    if (this.mapObjects.length === 0) {
      return false;
    }

    for (let key in this.mapObjects) {
      const value = this.mapObjects[key];
      if (value === object) {
        return true;
      }
    }
    return false;
  }

  /**
   * Tests if a screen object is registered in the package.
   *
   * @param object The screen object to test.
   *
   * @return Returns 'true' if the screen object is registered in the package.
   */
  public hasScreenObject(object: LVZScreenObject) {
    // Make sure the screen object isn't null or undefined.
    if (object == null) {
      throw new Error('The LVZScreenObject given is null or undefined.');
    }
    // Make sure we have registered screen objects.
    if (this.screenObjects.length === 0) {
      return false;
    }

    for (let key in this.screenObjects) {
      const value = this.screenObjects[key];
      if (value === object) {
        return true;
      }
    }
    return false;
  }

  /**
   * Adds all objects from a given collection.
   *
   * @param {LVZCollection} other The other collection to add all objects.
   */
  addAll(other: LVZCollection) {
    for (let index = 0; index < other.mapObjects.length; index++) {
      this.mapObjects.push(other.mapObjects[index]);
    }
    for (let index = 0; index < other.screenObjects.length; index++) {
      this.screenObjects.push(other.screenObjects[index]);
    }
  }
}

/**
 * The <i>LVZPackage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZPackage implements Validatable {

  public resources: LVZResource[];
  public images: CompiledLVZImage[];
  public mapObjects: CompiledLVZMapObject[];
  public screenObjects: CompiledLVZScreenObject[];

  public name: string;

  /**
   * @constructor
   *
   * @param {string} name The name of the package. (The name of the LVZ file)
   */
  public constructor(name: string) {
    this.name = name;
    this.resources = [];
    this.images = [];
    this.mapObjects = [];
    this.screenObjects = [];
  }

  /** @override */
  public validate(): void {
    for (let index = 0; index < this.resources.length; index++) {
      this.resources[index].validate();
    }
    for (let index = 0; index < this.images.length; index++) {
      this.images[index].validate();
    }
    for (let index = 0; index < this.mapObjects.length; index++) {
      this.mapObjects[index].validate(this);
    }
    for (let index = 0; index < this.screenObjects.length; index++) {
      this.screenObjects[index].validate(this);
    }
  }

  /**
   * Compiles the package of objects and resources into an OOP collection of editable LVZ objects.
   *
   * @return {LVZCollection} Returns the compiled LVZ collection.
   */
  public collect(): LVZCollection {
    let collection = new LVZCollection();
    let unpackedImages: LVZImage[] = [];

    // Unpack images.
    for (let index = 0; index < this.images.length; index++) {
      unpackedImages.push(this.images[index].unpack());
    }

    // Unpack map objects.
    for (let index = 0; index < this.mapObjects.length; index++) {
      let next = this.mapObjects[index];
      let image = unpackedImages[next.image];
      let x = next.x;
      let y = next.y;
      let id = next.id;
      let layer = next.layer;
      let mode = next.mode;
      let time = next.time;
      let decompiled = new LVZMapObject(image, x, y, id, layer, mode, time);
      collection.addMapObject(decompiled);
    }

    // Unpack screen objects.
    for (let index = 0; index < this.screenObjects.length; index++) {
      let next = this.screenObjects[index];
      let image = unpackedImages[next.image];
      let x = next.x;
      let y = next.y;
      let id = next.id;
      let time = next.time;
      let layer = next.layer;
      let xType = next.xType;
      let yType = next.yType;
      let mode = next.mode;
      let decompiled = new LVZScreenObject(image, x, y, id, time, layer, xType, yType, mode);
      collection.addScreenObject(decompiled);
    }

    return collection;
  }

  apply(collection: LVZCollection): void {
    collection.validate();

    /**
     * Adds a resource if the resource is not contained in the LVZ package.
     *
     * @param {LVZResource} resource The resource to add.
     */
    const processResource = (resource: LVZResource): void => {
      for (let index = 0; index < this.resources.length; index++) {
        if (this.resources[index].equals(resource)) {
          return;
        }
      }
      this.resources.push(resource);
    };

    /**
     *
     * @param {LVZImage} image
     *
     * @return {CompiledLVZImage}
     */
    const compileImage = (image: LVZImage): CompiledLVZImage => {
      processResource(image.getResource());
      return new CompiledLVZImage(this,
        image.getResource().getName(),
        image.getXFrames(),
        image.getYFrames(),
        image.getAnimationTime()
      );
    };

    /**
     *
     * @param {LVZImage} image
     *
     * @return {number}
     */
    const getImageIndex = (image: LVZImage): number => {
      let resultIndex = -1;
      for (let index = 0; index < this.images.length; index++) {
        if (this.images[index].equals(image)) {
          resultIndex = index;
          break;
        }
      }
      if (resultIndex == -1) {
        resultIndex = this.images.length;
        this.images.push(compileImage(image));
      }
      return resultIndex;
    };

    const mapObjects = collection.getMapObjects();
    const screenObjects = collection.getScreenObjects();
    for (let index = 0; index < mapObjects.length; index++) {
      const next = mapObjects[index];
      const image = getImageIndex(next.image);
      const compiledMapObject = new CompiledLVZMapObject(this,
        next.id,
        next.x,
        next.y,
        image,
        next.layer,
        next.time,
        next.mode
      );
      this.mapObjects.push(compiledMapObject);
    }
    for (let index = 0; index < screenObjects.length; index++) {
      const next = screenObjects[index];
      const image = getImageIndex(next.getImage());
      const compiledScreenObject = new CompiledLVZScreenObject(this,
        next.getId(),
        next.getXType(),
        next.getX(),
        next.getYType(),
        next.getY(),
        image,
        next.getLayer(),
        next.getDisplayTime(),
        next.getMode()
      );
      this.screenObjects.push(compiledScreenObject);
    }
  }

  public pack(): CompressedLVZPackage {
    return LVZ.compress(this);
  }

  public addResource(file: LVZResource): void {
    this.resources.push(file);
  }

  public addImage(image: CompiledLVZImage): void {
    this.images.push(image);
  }

  public addMapObject(object: CompiledLVZMapObject): void {
    this.mapObjects.push(object);
  }

  /**
   *
   * @param {CompiledLVZMapObject} object
   */
  removeMapObject(object: CompiledLVZMapObject): void {
    if (object == null) {
      throw new Error('The map-object given is null or undefined.');
    }
    let newArray: CompiledLVZMapObject[] = [];
    for (let index = 0; index < this.mapObjects.length; index++) {
      const next = this.mapObjects[index];
      if (next === object) {
        continue;
      }
      newArray.push(next);
    }
    this.mapObjects = newArray;
  }

  /**
   *
   * @param {CompiledLVZScreenObject} object
   */
  public addScreenObject(object: CompiledLVZScreenObject): void {
    this.screenObjects.push(object);
  }

  public getMapObjects(): CompiledLVZMapObject[] {
    return this.mapObjects;
  }

  getScreenObjects(): CompiledLVZScreenObject[] {
    return this.screenObjects;
  }

  createMapObject(
    image: number,
    coords: { x: number; y: number },
    layer: LVZRenderLayer = LVZRenderLayer.AfterTiles,
    time: number = 0,
    mode: LVZDisplayMode = LVZDisplayMode.ShowAlways
  ) {
    let index = this.mapObjects.length;
    this.mapObjects.push(new CompiledLVZMapObject(this, index, coords.x, coords.y, image, layer, time, mode));
  }

  /**
   * @param {string} name The name of the resource.
   *
   * @return {LVZResource} Returns the resource that matches the name.
   */
  getResource(name: string) {
    if (this.resources == null || this.resources.length === 0) {
      return;
    }
    for (let index = 0; index < this.resources.length; index++) {
      let next = this.resources[index];
      if (next.getName() === name) {
        return next;
      }
    }
    return null;
  }
}

/**
 * The <i>CompressedLVZPackage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompressedLVZPackage {

  public sections: CompressedLVZSection[];
  public name: string;

  /**
   * @constructor
   *
   * @param name The name of the package. (The name of the LVZ file)
   */
  constructor(name: string) {
    this.name = name;
    this.sections = [];
  }

  public inflate(): LVZPackage {
    return LVZ.decompress(this);
  }

  /**
   * Tests whether the compressed section is registered in the package.
   *
   * @param section The section to test.
   *
   * @return Returns 'true' if the section is registered in the package.
   */
  public hasSection(section: CompressedLVZSection): boolean {
    // Make sure we have registered sections first.
    if (this.sections.length === 0) {
      return false;
    }

    for (let key in this.sections) {
      let value = this.sections[key];
      if (value === section) {
        return true;
      }
    }
    return false;
  }

  /**
   * Registers a section to the compiled package.
   *
   * @param section The section to add.
   *
   * @throws Error Thrown if the section given is null, undefined, or already registered to the package.
   */
  public addSection(section: CompressedLVZSection): void {
    // Make sure the section isn't null or undefined.
    if (section == null) {
      throw new Error('The LVZCompressedSection given is null or undefined.');
    }

    // Make sure that the section isn't already registered to the package.
    if (this.hasSection(section)) {
      // Make sure that Object-Data sections have a label.
      let fileName = section.fileName;
      if (fileName == null || fileName.length === 0) {
        fileName = '[OBJECT DATA SECTION]';
      }
      throw new Error(`The LVZCompressedPackage "${this.name}" already has the LVZCompressedSection "${fileName}".`);
    }

    // Add the section to the next portion of the list.
    this.sections.push(section);
  }

  /**
   * Unregisters a section from the compiled package.
   *
   * @param section The section to remove.
   *
   * @throws Error Thrown if the section given is null, undefined, or is not registered to the package.
   */
  public removeSection(section: CompressedLVZSection): void {
    // Make sure the section isn't null or undefined.
    if (section == null) {
      throw new Error('The LVZCompressedSection given is null or undefined.');
    }

    // Make sure that the section is registered to the package.
    if (!this.hasSection(section)) {
      // Make sure that Object-Data sections have a label.
      let fileName = section.fileName;
      if (fileName == null || fileName.length === 0) {
        fileName = '[OBJECT DATA SECTION]';
      }
      throw new Error(`The LVZCompressedPackage "${this.name}" does not contain the LVZCompressedSection "${fileName}".`);
    }

    const newArray: CompressedLVZSection[] = [];
    let offset: number = 0;
    for (let index = 0; index < this.sections.length; index++) {
      const nextSection = this.sections[index];
      if (nextSection === section) {
        continue;
      }
      newArray[offset++] = nextSection;
    }

    this.sections = newArray;
  }

  /** @return Returns all registered sections in the compressed package. */
  public getSections(): CompressedLVZSection[] {
    return this.sections;
  }

  /** @return Returns the count of registered sections in the compressed package. */
  public getSectionCount(): number {
    return this.sections.length;
  }
}

/**
 * The <i>CompressedLVZSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompressedLVZSection {

  public readonly decompressSize: number;
  public readonly fileTime: number;
  public readonly compressSize: number;
  public readonly fileName: string;
  public readonly data: Buffer;

  /**
   * Main constructor.
   *
   * @param {number} decompressSize
   * @param {number} fileTime
   * @param {number} compressSize
   * @param {string} fileName
   * @param {Buffer} data
   */
  constructor(decompressSize: number, fileTime: number, compressSize: number, fileName: string, data: Buffer) {
    this.decompressSize = decompressSize;
    this.fileTime = fileTime;
    this.compressSize = compressSize;
    this.fileName = fileName;
    this.data = data;
  }

  /**
   * Inflates the compressed LVZ data section to parsable data.
   *
   * @return {DecompressedLVZSection}
   */
  public inflate(): DecompressedLVZSection {
    let data: Buffer = zlib.inflateSync(this.data);
    return new DecompressedLVZSection(this.decompressSize, this.fileTime, this.compressSize, this.fileName, data);
  }
}

/**
 * The <i>DecompressedLVZSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class DecompressedLVZSection {

  public readonly decompressSize: number;
  public readonly fileTime: number;
  public readonly compressSize: number;
  public readonly fileName: string;
  public readonly data: Buffer;
  public readonly isObjectSection: boolean;

  /**
   * @constructor
   *
   * @param {number} decompressSize
   * @param {number} fileTime
   * @param {number} compressSize
   * @param {string} fileName
   * @param {Buffer} data
   */
  constructor(decompressSize: number, fileTime: number, compressSize: number, fileName: string, data: Buffer) {
    this.decompressSize = decompressSize;
    this.fileTime = fileTime;
    this.compressSize = compressSize;
    this.fileName = fileName;
    this.data = data;
    this.isObjectSection = fileTime == 0;
  }

  /**
   * Compresses the LVZ data section to a writable data block.
   *
   * @return {CompressedLVZSection}
   */
  public deflate(): CompressedLVZSection {
    const fileName = this.fileName;
    const fileTime = this.fileTime;
    const decompressSize = this.data.length;
    const compressedData = zlib.deflateSync(this.data);
    const compressSize = compressedData.length;
    return new CompressedLVZSection(decompressSize, fileTime, compressSize, fileName, compressedData);
  }
}

/**
 * The <i>LVZResource</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZResource implements Validatable, Dirtable {

  private data: Buffer;
  private name: string;
  private time: number;
  private dirty: boolean;

  /**
   * @constructor
   *
   * @param {string} nameOrPath
   * @param {Buffer} data
   * @param {number} time
   */
  constructor(nameOrPath: string, data: Buffer = null, time: number = null) {
    // If the data is not defined, assume the name is actually a file path to read.
    if (data == null) {
      // Make sure the file exists before loading it.
      if (!fs.existsSync(nameOrPath)) {
        throw new Error(`The file does not exist: ${nameOrPath}`);
      }
      // Attempt to read the file.
      this.data = fs.readFileSync(nameOrPath);
      // Allow for overriding file time.
      if (time == null) {
        time = fs.statSync(nameOrPath).mtime.getUTCMilliseconds();
      }
    }
    // If the data is defined, then the name is a name and data is the file data to set.
    else {
      this.name = nameOrPath;
      this.data = data;
    }

    if (time != null) {
      this.time = time;
    } else {
      // Ensure that the file time is set.
      this.time = Date.now();
    }
    this.dirty = true;
  }

  /** @override */
  public toString(): string {
    return `LVZResource={name=${this.name}, time=${this.time}, data=Buffer (${this.data.length} bytes)}`;
  }

  /** @override */
  public validate(): void {
    let status = LVZ.validateResource(this);
    if (status !== LVZErrorStatus.SUCCESS) {
      let message = `Error Code: ${status}`;
      if (status === LVZErrorStatus.RESOURCE_DATA_NULL) {
        message = 'The LVZResource does not have a data buffer.';
      } else if (status === LVZErrorStatus.RESOURCE_NAME_NULL) {
        message = 'The LVZResource name is null or undefined.';
      } else if (status === LVZErrorStatus.RESOURCE_NAME_EMPTY) {
        message = 'The LVZResource name is empty.';
      } else if (status === LVZErrorStatus.RESOURCE_TIME_NEGATIVE) {
        message = 'The LVZResource timestamp is negative.';
      }
      console.log(message);
      throw new EvalError(message);
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  compress(): CompressedLVZSection {
    const compressedData = zlib.deflateSync(this.data);
    const compressSize = compressedData.length;
    return new CompressedLVZSection(this.data.length, this.time, compressSize, this.name, compressedData);
  }

  equals(other: any): boolean {
    if (other instanceof LVZResource) {
      return other.data === this.data
        && other.name === this.name
        && other.time === this.time;
    }
    return false;
  }

  getData(): Buffer {
    return this.data;
  }

  setData(data: Buffer): void {
    if (!data.equals(this.data)) {
      this.data = data;
      this.setDirty(true);
    }
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    if (this.name !== name) {
      this.name = name;
      this.setDirty(true);
    }
  }

  getTime(): number {
    return this.time;
  }

  setTime(time: number): void {
    if (this.time !== time) {
      this.time = time;
      this.setDirty(true);
    }
  }

  isImage(): boolean {
    const extension = this.getExtension();
    for (let index = 0; index < ACCEPTED_FORMATS.length; index++) {
      if (extension === ACCEPTED_FORMATS[index]) {
        return true;
      }
    }
    return false;
  }

  getExtension(): string {
    if (this.name.indexOf('.') != -1) {
      return this.name.toLowerCase().split('.')[1].trim();
    }
    return null;
  }

  getMimeType() {
    switch (this.getExtension()) {
      case 'bm2':
      case 'bmp':
        return 'image/bmp';
      case 'gif':
        return 'image/gif';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
    }
    return null;
  }

  isEmpty(): boolean {
    return this.data == null || this.data.length === 0;
  }
}

/**
 * The <i>CompiledLVZImage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompiledLVZImage {

  readonly pkg: LVZPackage;

  fileName: string;
  animationTime: number;
  xFrames: number;
  yFrames: number;

  /**
   * @constructor
   *
   * @param {LVZPackage} pkg
   * @param {string} fileName
   * @param {number} xFrames
   * @param {number} yFrames
   * @param {number} animationTime
   */
  constructor(pkg: LVZPackage, fileName: string, xFrames: number = 1, yFrames: number = 1, animationTime: number = 0) {
    this.pkg = pkg;
    this.fileName = fileName;
    this.animationTime = animationTime;
    this.xFrames = xFrames;
    this.yFrames = yFrames;
  }

  public validate(): void {
    let status = LVZ.validateCompiledImage(this);
    if (status !== LVZErrorStatus.SUCCESS) {
      let message = `Error Code: ${status}`;
      console.log(message);
      throw new EvalError(message);
    }
  }

  equals(other: any) {
    if (other instanceof LVZImage) {
      return other.getResource().getName() == this.fileName
        && other.getXFrames() == this.xFrames
        && other.getYFrames() == this.yFrames
        && other.getAnimationTime() == this.animationTime;
    } else if (other instanceof CompiledLVZImage) {
      return other.fileName == this.fileName
        && other.xFrames == this.xFrames
        && other.yFrames == this.yFrames
        && other.animationTime == this.animationTime;
    }
    return false;
  }

  unpack(): LVZImage {
    let resource = this.pkg.getResource(this.fileName);
    return new LVZImage(resource, this.xFrames, this.yFrames, this.animationTime);
  }
}

/**
 * The <i>LVZImage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZImage implements Validatable, Dirtable {

  private resource: LVZResource;
  private animationTime: number;
  private xFrames: number;
  private yFrames: number;
  private dirty: boolean;

  private sprite: MapSprite;

  /**
   * @constructor
   *
   * @param {LVZResource} file
   * @param {number} xFrames
   * @param {number} yFrames
   * @param {number} animationTime
   */
  constructor(file: LVZResource, xFrames: number = 1, yFrames: number = 1, animationTime: number = 0) {
    this.resource = file;
    this.animationTime = animationTime;
    this.xFrames = xFrames;
    this.yFrames = yFrames;
    this.dirty = true;
  }

  /** @override */
  public toString(): string {
    return `LVZImage={${this.resource.toString()}, xFrames=${this.xFrames}, yFrames=${this.yFrames}, animationTime=${this.animationTime}}`;
  }

  /** @override */
  public validate(): void {
    const status = LVZ.validateImage(this);
    if (status !== LVZErrorStatus.SUCCESS) {
      let message;
      if (status === LVZErrorStatus.IMAGE_RESOURCE_NULL) {
        message = 'The LVZImage resource is null.';
      } else if (status === LVZErrorStatus.ANIMATION_TIME_OUT_OF_RANGE) {
        message = `The LVZImage animationTime is out of range. The range is between ${LVZ.IMAGE_ANIMATION_TIME_MIN} and ${LVZ.IMAGE_ANIMATION_TIME_MAX}.`;
      } else if (status === LVZErrorStatus.X_FRAME_COUNT_OUT_OF_RANGE) {
        message = `The LVZImage xFrames is out of range. The range is between ${LVZ.IMAGE_FRAME_COUNT_MIN} and ${LVZ.IMAGE_FRAME_COUNT_MAX}. (Value is ${this.xFrames})`;
      } else if (status === LVZErrorStatus.Y_FRAME_COUNT_OUT_OF_RANGE) {
        message = `The LVZImage yFrames is out of range. The range is between ${LVZ.IMAGE_FRAME_COUNT_MIN} and ${LVZ.IMAGE_FRAME_COUNT_MAX}. (Value is ${this.yFrames})`;
      }
      console.log(message);
      throw new EvalError(message);
    }
  }

  compile(pkg: LVZPackage): CompiledLVZImage {
    return new CompiledLVZImage(pkg,
      this.getResource().getName(),
      this.getXFrames(),
      this.getYFrames(),
      this.getAnimationTime()
    );
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  getResource(): LVZResource {
    return this.resource;
  }

  setResource(resource: LVZResource): void {
    if (this.resource !== resource) {
      this.resource = resource;
      // The resource changed. The texture is now invalid and needs to be destroyed.
      this.sprite.texture.destroy(true);
      this.sprite = null;
      this.setDirty(true);
    }
  }

  getAnimationTime(): number {
    return this.animationTime;
  }

  setAnimationTime(time: number): void {
    if (this.animationTime !== time) {
      this.animationTime = time;
      // TODO: Apply to sprite if exists.
      this.setDirty(true);
    }
  }

  getXFrames(): number {
    return this.xFrames;
  }

  setXFrames(frames: number): void {
    if (this.xFrames !== frames) {
      this.xFrames = frames;
      // TODO: Apply to sprite if exists.
      this.setDirty(true);
    }
  }

  getYFrames(): number {
    return this.yFrames;
  }

  setYFrames(frames: number): void {
    if (this.yFrames !== frames) {
      this.yFrames = frames;
      // TODO: Apply to sprite if exists.
      this.setDirty(true);
    }
  }

  isAnimated(): boolean {
    return this.xFrames > 1 || this.yFrames > 1;
  }
}

/**
 * The <i>CompiledLVZMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompiledLVZMapObject {

  readonly pkg: LVZPackage;

  id: number;
  x: number;
  y: number;
  image: number;
  layer: number;
  time: number;
  mode: number;

  /**
   * @constructor
   *
   * @param {LVZPackage} pkg
   * @param {number} id
   * @param {number} x
   * @param {number} y
   * @param {number} image
   * @param {number} layer
   * @param {number} time
   * @param {number} mode
   */
  constructor(pkg: LVZPackage, id: number, x: number, y: number, image: number, layer: number, time: number, mode: number) {
    this.pkg = pkg;
    this.id = id;
    this.x = x;
    this.y = y;
    this.image = image;
    this.layer = layer;
    this.time = time;
    this.mode = mode;
  }

  validate(dpkg: LVZPackage): void {
    const status = LVZ.validateDecompressedMapObject(dpkg, this);
    if (status !== LVZErrorStatus.SUCCESS) {
      let message = `Error Code: ${status}`;
      console.log(message);
      throw new EvalError(message);
    }
  }
}

/**
 * The <i>LVZMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZMapObject implements Validatable, Dirtable {

  public image: LVZImage;
  public x: number;
  public y: number;
  public id: number;
  public layer: LVZRenderLayer;
  public mode: LVZDisplayMode;
  public time: number;
  public dirty: boolean;

  /**
   * @constructor
   *
   * @param {LVZImage} image The LVZ image object to display.
   * @param {number} x The X coordinate of the object. (In pixels)
   * @param {number} y The Y coordinate of the object. (In pixels)
   * @param {number} id The display ID of the object.
   * @param {LVZRenderLayer} layer The layer to render the object. (DEFAULT: AfterTiles)
   * @param {LVZDisplayMode} mode The display mode for the object. (DEFAULT: ShowAlways)
   * @param {number} time The time to display the object. (DEFAULT: 0. 0 disabled timed display)
   */
  public constructor(
    image: LVZImage,
    x: number,
    y: number,
    id: number = 0,
    layer: LVZRenderLayer = LVZRenderLayer.AfterTiles,
    mode: LVZDisplayMode = LVZDisplayMode.ShowAlways,
    time: number = 0) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.id = id;
    this.layer = layer;
    this.mode = mode;
    this.time = time;
    this.dirty = true;
  }

  /** @override */
  public validate(): void {
    const state = LVZ.validateMapObject(this);
    if (state !== LVZErrorStatus.SUCCESS) {
      let message = null;
      if (state == LVZErrorStatus.IMAGE_NOT_DEFINED) {
        message = 'The LVZMapObject does not have a image.';
      } else if (state == LVZErrorStatus.OBJECT_ID_OUT_OF_RANGE) {
        message = `The LVZMapObject's Object ID is out of range. Object IDs can be between ${LVZ.OBJECT_ID_MIN} and ${LVZ.OBJECT_ID_MAX}. (${this.id} given)`;
      } else if (state == LVZErrorStatus.X_COORDINATE_OUT_OF_RANGE) {
        message = `The LVZMapObject X coordinate is out of range. Coordinates can be between ${LVZ.MAP_OBJECT_COORDINATE_MIN} and ${LVZ.MAP_OBJECT_COORDINATE_MAX}. (${this.x} given)`;
      } else if (state == LVZErrorStatus.Y_COORDINATE_OUT_OF_RANGE) {
        message = `The LVZMapObject Y coordinate is out of range. Coordinates can be between ${LVZ.MAP_OBJECT_COORDINATE_MIN} and ${LVZ.MAP_OBJECT_COORDINATE_MAX}. (${this.y} given)`;
      } else if (state == LVZErrorStatus.DISPLAY_MODE_OUT_OF_RANGE) {
        message = `The LVZMapObject's 'display mode' is out of range. Display modes can be between ${LVZ.DISPLAY_MODE_MIN} and ${LVZ.DISPLAY_MODE_MAX}. (${this.mode} given)`;
      } else if (state == LVZErrorStatus.RENDER_LAYER_OUT_OF_RANGE) {
        message = `The LVZMapObject's 'render mode' is out of range. Render layers can be between ${LVZ.RENDER_LAYER_MIN} and ${LVZ.RENDER_LAYER_MAX}. (${this.layer} given)`;
      } else if (state == LVZErrorStatus.DISPLAY_TIME_OUT_OF_RANGE) {
        message = `The LVZMapObject's 'display time' is out of range. Display times can be between ${LVZ.DISPLAY_TIME_MIN} and ${LVZ.DISPLAY_TIME_MAX}. (${this.time} given)`;
      }
      console.warn(message);
      throw new Error(message);
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  /** @return {LVZImage} Returns the image displayed for the object. */
  public getImage(): LVZImage {
    return this.image;
  }

  /**
   * Sets the image displayed for the object.
   *
   * @param {LVZImage} image The image to set.
   */
  public setImage(image: LVZImage): void {
    if (this.image !== image) {
      this.image = image;
      this.setDirty(true);
    }
  }

  /** @return {number} Returns the X coordinate of the object. (In pixels) */
  public getX(): number {
    return this.x;
  }

  /**
   * Sets the X coordinate of the object. (In pixels)
   *
   * @param {number} value The value to set.
   */
  public setX(value: number): void {
    if (this.x !== value) {
      this.x = value;
      this.setDirty(true);
    }
  }

  /** @return Returns the Y coordinate of the object. (In pixels) */
  public getY(): number {
    return this.y;
  }

  /**
   * Sets the Y coordinate of the object. (In pixels)
   *
   * @param {number} value The value to set.
   */
  public setY(value: number): void {
    if (this.y !== value) {
      this.y = value;
      this.setDirty(true);
    }
  }

  /** @return Returns the assigned ID of the object to use for toggling the 'ServerControlled' {@link LVZDisplayMode}. */
  public getId(): number {
    return this.id;
  }

  /**
   * Sets the ID of the object to use for toggling the 'ServerControlled' {@link LVZDisplayMode}.
   *
   * @param {number} id The ID to set.
   */
  public setId(id: number): void {
    // TODO: Possible check for ID being negative. -Jab
    if (this.id !== id) {
      this.id = id;
      this.setDirty(true);
    }
  }

  /** @return Returns the assigned layer to render the object. */
  public getLayer(): LVZRenderLayer {
    return this.layer;
  }

  /**
   * Sets the layer to render the object.
   *
   * @param {LVZRenderLayer} layer The layer to set.
   */
  public setLayer(layer: LVZRenderLayer): void {
    if (this.layer !== layer) {
      this.layer = layer;
      this.setDirty(true);
    }

  }

  /** @return {LVZDisplayMode} Returns the display mode for how the object should display. */
  public getMode(): LVZDisplayMode {
    return this.mode;
  }

  /**
   * Sets the display mode for how the object should display.
   *
   * @param {LVZDisplayMode} mode The display mode to set.
   */
  public setMode(mode: LVZDisplayMode): void {
    if (this.mode !== mode) {
      this.mode = mode;
      this.setDirty(true);
    }
  }

  /**
   * @return {number} Returns the time that the object will show when toggled on. <p>
   *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
   */
  public getDisplayTime(): number {
    return this.time;
  }

  /**
   * Sets the time that the object will display when toggled on.
   * @param {number} time The display-time to set. <p>
   *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
   */
  public setDisplayTime(time: number): void {
    if (this.time !== time) {
      this.time = time;
      this.setDirty(true);
    }
  }
}

/**
 * The <i>CompiledLVZScreenObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompiledLVZScreenObject {

  pkg: LVZPackage;
  id: number;
  xType: number;
  x: number;
  yType: number;
  y: number;
  image: number;
  layer: number;
  time: number;
  mode: number;

  /**
   * @constructor
   *
   * @param {LVZPackage} pkg
   * @param {number} id
   * @param {number} xType
   * @param {number} x
   * @param {number} yType
   * @param {number} y
   * @param {number} image
   * @param {number} layer
   * @param {number} time
   * @param {number} mode
   */
  constructor(
    pkg: LVZPackage,
    id: number,
    xType: number,
    x: number,
    yType: number,
    y: number,
    image: number,
    layer: number,
    time: number,
    mode: number) {
    this.pkg = pkg;
    this.id = id;
    this.xType = xType;
    this.x = x;
    this.yType = yType;
    this.y = y;
    this.image = image;
    this.layer = layer;
    this.time = time;
    this.mode = mode;
  }

  public validate(dpkg: LVZPackage): void {
    const status = LVZ.validateDecompressedScreenObject(dpkg, this);
    if (status !== LVZErrorStatus.SUCCESS) {
      const message = `Error Code: ${status}`;
      console.log(message);
      throw new EvalError(message);
    }
  }
}

/**
 * The <i>LVZScreenObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZScreenObject implements Validatable, Dirtable {

  private image: LVZImage;
  private x: number;
  private y: number;
  private id: number;
  private time: number;
  private layer: LVZRenderLayer;
  private xType: LVZXType;
  private yType: LVZYType;
  private mode: LVZDisplayMode;
  private dirty: boolean;

  /**
   * @constructor
   *
   * @param {LVZImage} image The LVZ image object to display.
   * @param x {number} The X coordinate of the object. (In pixels)
   * @param y {number} The Y coordinate of the object. (In pixels)
   * @param id {number} The display ID of the object.
   * @param time {number} The time to display the object. (DEFAULT: 0. 0 disabled timed display)
   * @param layer {LVZRenderLayer} The layer to render the object. (DEFAULT: AfterTiles)
   * @param xType {LVZXType} The x coordinate's origin position on the screen. (DEFAULT: SCREEN_LEFT)
   * @param yType {LVZYType} The y coordinate's origin position on the screen. (DEFAULT: SCREEN_TOP)
   * @param mode {LVZDisplayMode} The display mode for the object. (DEFAULT: ShowAlways)
   */
  public constructor(
    image: LVZImage,
    x: number,
    y: number,
    id: number = 0,
    time: number = 0,
    layer: LVZRenderLayer = LVZRenderLayer.TopMost,
    xType: LVZXType = LVZXType.SCREEN_LEFT,
    yType: LVZYType = LVZYType.SCREEN_TOP,
    mode: LVZDisplayMode = LVZDisplayMode.ShowAlways) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.id = id;
    this.time = time;
    this.layer = layer;
    this.xType = xType;
    this.yType = yType;
    this.mode = mode;
    this.dirty = true;
  }

  /** @override */
  public validate(): void {
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  /** @return {LVZImage} Returns the image displayed for the object. */
  public getImage(): LVZImage {
    return this.image;
  }

  /**
   * Sets the image displayed for the object.
   *
   * @param {LVZImage} image The image to set.
   */
  public setImage(image: LVZImage): void {
    if (this.image !== image) {
      this.image = image;
      this.setDirty(true);
    }
  }

  /**
   * @return {number} Returns the X coordinate of the object. (In pixels)
   */
  public getX(): number {
    return this.x;
  }

  /**
   * Sets the X coordinate of the object. (In pixels)
   *
   * @param {number} value The value to set.
   */
  public setX(value: number): void {
    if (this.x !== value) {
      this.x = value;
      this.setDirty(true);
    }
  }

  /**
   * @return {number} Returns the Y coordinate of the object. (In pixels)
   */
  public getY(): number {
    return this.y;
  }

  /**
   * Sets the Y coordinate of the object. (In pixels)
   *
   * @param {number} value The value to set.
   */
  public setY(value: number): void {
    if (this.y !== value) {
      this.y = value;
      this.setDirty(true);
    }
  }

  /**
   * @return {number} Returns the assigned ID of the object to use for toggling the 'ServerControlled'
   *   {@link LVZDisplayMode}.
   */
  public getId(): number {
    return this.id;
  }

  /**
   * Sets the ID of the object to use for toggling the 'ServerControlled' {@link LVZDisplayMode}.
   *
   * @param {number} id The ID to set.
   */
  public setId(id: number): void {

    // TODO: Possible check for ID being negative. -Jab
    if (this.id !== id) {
      this.id = id;
      this.setDirty(true);
    }
  }

  /**
   * @return {LVZRenderLayer} Returns the assigned layer to render the object.
   */
  public getLayer(): LVZRenderLayer {
    return this.layer;
  }

  /**
   * Sets the layer to render the object.
   *
   * @param layer {LVZRenderLayer} The layer to set.
   */
  public setLayer(layer: LVZRenderLayer): void {
    if (this.layer !== layer) {
      this.layer = layer;
      this.setDirty(true);
    }
  }

  /**
   * @return {LVZDisplayMode} Returns the display mode for how the object should display.
   */
  public getMode(): LVZDisplayMode {
    return this.mode;
  }

  /**
   * Sets the display mode for how the object should display.
   *
   * @param {LVZDisplayMode} mode The display mode to set.
   */
  public setMode(mode: LVZDisplayMode): void {
    if (this.mode !== mode) {
      this.mode = mode;
      this.setDirty(true);
    }
  }

  /**
   * @return {number} Returns the time that the object will show when toggled on. <p>
   *     <b>NOTE:</b> A display-time of <b>0</b> will show indefinitely until otherwise toggled off.
   */
  public getDisplayTime(): number {
    return this.time;
  }

  /**
   * Sets the time that the object will display when toggled on.
   *
   * @param {number} time The display-time to set. <p>
   *     <b>NOTE:</b> A display-time of <b>0</b> will show indefinitely until otherwise toggled off.
   */
  public setDisplayTime(time: number): void {
    if (this.time !== time) {
      this.time = time;
      this.setDirty(true);
    }
  }

  /**
   * @return {LVZXType} Returns the X-coordinate-origin on the screen the object's X coordinate will offset.
   */
  public getXType(): LVZXType {
    return this.xType;
  }

  /**
   * Sets the X-coordinate-origin on the screen that the object's X coordinate will offset.
   *
   * @param {LVZXType} type The type to set.
   */
  public setXType(type: LVZXType): void {
    if (this.xType !== type) {
      this.xType = type;
      this.setDirty(true);
    }
  }

  /**
   * @return {LVZYType} Returns the Y-coordinate-origin on the screen the object's Y coordinate will offset.
   */
  public getYType(): LVZYType {
    return this.yType;
  }

  /**
   * Sets the Y-coordinate-origin on the screen that the object's Y coordinate will offset.
   *
   * @param type {LVZYType} The type to set.
   */
  public setYType(type: LVZYType): void {
    if (this.yType !== type) {
      this.yType = type;
      this.setDirty(true);
    }
  }
}

/**
 * The <i>LVZRenderLayer</i> enum. TODO: Document.
 *
 * <ul>
 *      <li> 0 = BelowAll
 *      <li> 1 = AfterBackground
 *      <li> 2 = AfterTiles
 *      <li> 3 = AfterWeapons
 *      <li> 4 = AfterShips
 *      <li> 5 = AfterGauges
 *      <li> 6 = AfterChat
 *      <li> 7 = TopMost
 * </ul>
 *
 * @author Jab
 */
export enum LVZRenderLayer {
  BelowAll = 0,
  AfterBackground = 1,
  AfterTiles = 2,
  AfterWeapons = 3,
  AfterShips = 4,
  AfterGauges = 5,
  AfterChat = 6,
  TopMost = 7
}

/**
 * The <i>LVZDisplayMode</i> class. TODO: Document.
 *
 * <ul>
 *      <li> 0 = ShowAlways
 *      <li> 1 = EnterZone
 *      <li> 2 = EnterArena
 *      <li> 3 = Kill
 *      <li> 4 = Death
 *      <li> 5 = ServerControlled
 * </ul>
 *
 * @author Jab
 */
export enum LVZDisplayMode {
  ShowAlways = 0,
  EnterZone = 1,
  EnterArena = 2,
  Kill = 3,
  Death = 4,
  ServerControlled = 5
}

/**
 * The <i>LVZXType</i> enum. TODO: Document.
 *
 * <ul>
 *      <li> 0 = Normal (no letters in front)
 *      <li> 1 = Screen center
 *      <li> 2 = Bottom right corner
 *      <li> 3 = Stats box, lower right corner
 *      <li> 4 = Top right corner of specials
 *      <li> 5 = Bottom right corner of specials
 *      <li> 6 = Below energy bar & spec data
 *      <li> 7 = Top left corner of chat
 *      <li> 8 = Top left corner of radar
 *      <li> 9 = Top left corner of radar's text (clock/location)
 *      <li> 10 = Top left corner of weapons
 *      <li> 11 = Bottom left corner of weapons
 * </ul>
 *
 * @author Jab
 */
export enum LVZXType {
  SCREEN_LEFT = 0,
  SCREEN_CENTER = 1,
  SCREEN_RIGHT = 2,
  STATS_BOX_RIGHT_EDGE = 3,
  SPECIALS_RIGHT = 4,
  SPECIALS_RIGHT_2 = 5,
  ENERGY_BAR_CENTER = 6,
  CHAT_TEXT_RIGHT_EDGE = 7,
  RADAR_LEFT_EDGE = 8,
  CLOCK_LEFT_EDGE = 9,
  WEAPONS_LEFT = 10,
  WEAPONS_LEFT_2 = 11
}

/**
 * The <i>LVZYType</i> enum. TODO: Document.
 *
 * <ul>
 *      <li> 0 = Normal (no letters in front)
 *      <li> 1 = Screen center
 *      <li> 2 = Bottom right corner
 *      <li> 3 = Stats box, lower right corner
 *      <li> 4 = Top right corner of specials
 *      <li> 5 = Bottom right corner of specials
 *      <li> 6 = Below energy bar & spec data
 *      <li> 7 = Top left corner of chat
 *      <li> 8 = Top left corner of radar
 *      <li> 9 = Top left corner of radar's text (clock/location)
 *      <li> 10 = Top left corner of weapons
 *      <li> 11 = Bottom left corner of weapons
 * </ul>
 *
 * @author Jab
 */
export enum LVZYType {
  SCREEN_TOP = 0,
  SCREEN_CENTER = 1,
  SCREEN_BOTTOM = 2,
  STATS_BOX_BOTTOM_EDGE = 3,
  SPECIALS_TOP = 4,
  SPECIALS_BOTTOM = 5,
  BOTTOM_ENERGY_BAR = 6,
  CHAT_TOP = 7,
  RADAR_TOP = 8,
  CLOCK_TOP = 9,
  WEAPONS_TOP = 10,
  WEAPONS_BOTTOM = 11
}
