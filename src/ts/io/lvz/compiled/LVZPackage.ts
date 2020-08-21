import { Validatable } from '../../../util/Validatable';
import LVZCollection from '../object/LVZCollection';
import LVZResource from '../LVZResource';
import CompiledLVZImage from './CompiledLVZImage';
import CompiledLVZMapObject from './CompiledLVZMapObject';
import CompiledLVZScreenObject from './CompiledLVZScreenObject';
import LVZImage from '../object/LVZImage';
import LVZMapObject from '../object/LVZMapObject';
import LVZScreenObject from '../object/LVZScreenObject';
import CompressedLVZPackage from '../binary/CompressedLVZPackage';
import { LVZDisplayMode, LVZRenderLayer } from '../LVZProperties';
import { compressLVZ } from '../LVZUtils';

/**
 * The <i>LVZPackage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZPackage implements Validatable {

  public resources: LVZResource[] = [];
  public images: CompiledLVZImage[] = [];
  public mapObjects: CompiledLVZMapObject[] = [];
  public screenObjects: CompiledLVZScreenObject[] = [];
  public name: string;

  /**
   * @constructor
   *
   * @param {string} name The name of the package. (The name of the LVZ file)
   */
  public constructor(name: string) {
    this.name = name;
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
    const collection = new LVZCollection();
    const unpackedImages: LVZImage[] = [];

    // Unpack images.
    for (let index = 0; index < this.images.length; index++) {
      unpackedImages.push(this.images[index].unpack());
    }

    // Unpack map objects.
    for (let index = 0; index < this.mapObjects.length; index++) {
      const next = this.mapObjects[index];
      const image = unpackedImages[next.image];
      const x = next.x;
      const y = next.y;
      const id = next.id;
      const layer = next.layer;
      const mode = next.mode;
      const time = next.time;
      const decompiled = new LVZMapObject(image, x, y, id, layer, mode, time);
      collection.addMapObject(decompiled);
    }

    // Unpack screen objects.
    for (let index = 0; index < this.screenObjects.length; index++) {
      const next = this.screenObjects[index];
      const image = unpackedImages[next.image];
      const x = next.x;
      const y = next.y;
      const id = next.id;
      const time = next.time;
      const layer = next.layer;
      const xType = next.xType;
      const yType = next.yType;
      const mode = next.mode;
      const decompiled = new LVZScreenObject(image, x, y, id, time, layer, xType, yType, mode);
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
    return compressLVZ(this);
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
      const next = this.resources[index];
      if (next.getName() === name) {
        return next;
      }
    }
    return null;
  }
}

export default LVZPackage;
