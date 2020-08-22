import Dirtable from '../../../util/Dirtable';
import Validatable from '../../../util/Validatable';
import MapArea from '../../../util/map/MapArea';
import CoordinateType from '../../../util/map/CoordinateType';
import LVZMapObject from './LVZMapObject';
import LVZScreenObject from './LVZScreenObject';

/**
 * The <i>LVZCollection</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class LVZCollection implements Dirtable, Validatable {
  private mapObjects: LVZMapObject[] = [];
  private screenObjects: LVZScreenObject[] = [];
  private dirty: boolean = true;

  /**
   * @param {MapArea} area The boundaries to select & return map objects that intersect or are contained
   *   within.
   *
   * @return {LVZMapObject[]} Returns an array of map objects that intersect or are contained within the
   *   given area.
   */
  getNearby(area: MapArea): LVZMapObject[] {
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
  getMapObjects(): LVZMapObject[] {
    return this.mapObjects;
  }

  /** @return {LVZMapObject[]} Returns all screen objects contained within the LVZ collection. */
  getScreenObjects(): LVZScreenObject[] {
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
