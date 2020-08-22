import Dirtable from '../Dirtable';
import MapArea from './MapArea';
import CoordinateType from './CoordinateType';
import MapSection from './MapSection';

/**
 * The <i>MapSections</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class MapSections implements Dirtable {
  sections: MapSection[] = [];
  private bounds: MapArea;
  private array: boolean[][];
  private dirty: boolean = true;

  move(x: number, y: number): void {
    if (this.isEmpty() || x === 0 && y === 0) {
      return;
    }
    const sections: MapSection[] = [];
    for (let index = 0; index < this.sections.length; index++) {
      let result = this.sections[index].move(x, y);
      if (result != null) {
        sections.push(result);
      }
    }
    this.sections = sections;
    this.setDirty(true);
  }

  /**
   * Tests whether or not a point is selected.
   *
   * @param {number} x The 'X' coordinate to test.
   * @param {number} y The 'Y' coordinate to test.
   *
   * @return {boolean}
   */
  test(x: number, y: number): boolean {
    if (this.isEmpty()) {
      return true;
    }
    let result = false;
    // The last section to contain the point will determine the result.
    for (let index = this.sections.length - 1; index >= 0; index--) {
      // The section should only account for the result if the tile is inside of it.
      let next = this.sections[index];
      if (next.contains(x, y)) {
        result = next.test(x, y);
        break;
      }
    }
    return result;
  }

  getArray(): boolean[][] {
    if (this.array != null) {
      return this.array;
    }
    if (this.sections.length === 0) {
      return null;
    }
    const ourBounds = this.getBounds();
    const x1 = ourBounds.x1;
    const y1 = ourBounds.y1;
    const width = ourBounds.x2 - ourBounds.x1 + 1;
    const height = ourBounds.y2 - ourBounds.y1 + 1;

    // Create the map.
    this.array = new Array(width);
    for (let x = 0; x < width; x++) {
      this.array[x] = new Array(height);
      for (let y = 0; y < height; y++) {
        this.array[x][y] = false;
      }
    }
    // Populate the map.
    for (let index = 0; index < this.sections.length; index++) {
      const next = this.sections[index];
      const nextBounds = next.bounds;
      for (let y = nextBounds.y1; y <= nextBounds.y2; y++) {
        for (let x = nextBounds.x1; x <= nextBounds.x2; x++) {
          this.array[x - x1][y - y1] = !next.negate;
        }
      }
    }
    return this.array;
  }

  getBounds(): MapArea {
    if (this.bounds != null) {
      return this.bounds;
    }
    if (this.sections.length === 0) {
      return null;
    }
    const bounds = {x1: 1024, y1: 1024, x2: -1, y2: -1};
    const check = (x: number, y: number): void => {
      if (bounds.x1 > x) {
        bounds.x1 = x;
      }
      if (bounds.x2 < x) {
        bounds.x2 = x;
      }
      if (bounds.y1 > y) {
        bounds.y1 = y;
      }
      if (bounds.y2 < y) {
        bounds.y2 = y;
      }
    };

    for (let index = 0; index < this.sections.length; index++) {
      const next = this.sections[index];
      const x1 = next.x;
      const y1 = next.y;
      const x2 = x1 + next.width - 1;
      const y2 = y1 + next.height - 1;
      check(x1, y1);
      check(x2, y2);
    }
    this.bounds = new MapArea(CoordinateType.TILE, bounds.x1, bounds.y1, bounds.x2, bounds.y2);
    return this.bounds;
  }

  add(section: MapSection): void {
    // Make sure the group doesn't already have the section.
    for (let index = 0; index < this.sections.length; index++) {
      if (this.sections[index] === section) {
        return;
      }
    }
    // Push the section.
    this.sections.push(section);
    this.setDirty(true);
  }

  addAll(sections: MapSection[]) {
    for (let index = 0; index < sections.length; index++) {
      this.sections.push(sections[index]);
    }
    this.setDirty(true);
  }

  remove(section: MapSection) {
    const newArray = [];
    for (let index = 0; index < this.sections.length; index++) {
      const next = this.sections[index];
      if (next === section) {
        continue;
      }
      newArray.push(next);
    }

    this.sections.length = 0;
    for (let index = 0; index < newArray.length; index++) {
      this.sections.push(newArray[index]);
    }
    this.setDirty(true);
  }

  clear(): MapSection[] {
    // Copy the existing array to return.
    const toReturn: MapSection[] = [];
    for (let index = 0; index < this.sections.length; index++) {
      toReturn.push(this.sections[index]);
    }
    this.sections.length = 0;
    this.setDirty(true);
    return toReturn;
  }

  size(): number {
    return this.sections.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    if (this.dirty === flag) {
      return;
    }
    this.dirty = flag;
    if (flag) {
      this.bounds = null;
      this.array = null;
    }
  }
}
