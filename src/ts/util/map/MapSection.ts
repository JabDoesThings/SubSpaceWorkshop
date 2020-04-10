import { Dirtable } from '../Dirtable';
import { MapArea } from './MapArea';
import { CoordinateType } from './CoordinateType';
import { MapPoint } from './MapPoint';

/**
 * The <i>MapSections</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapSections implements Dirtable {

    sections: MapSection[];

    private dirty: boolean;
    private array: boolean[][];
    private bounds: MapArea;

    /**
     * Main constructor.
     */
    constructor() {

        this.sections = [];

        this.dirty = true;
    }

    move(x: number, y: number): void {

        if (this.isEmpty() || x === 0 && y === 0) {
            return;
        }

        let sections: MapSection[] = [];

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
     * @param x The 'X' coordinate to test.
     * @param y The 'Y' coordinate to test.
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

        let ourBounds = this.getBounds();
        let x1 = ourBounds.x1;
        let y1 = ourBounds.y1;
        let width = ourBounds.x2 - ourBounds.x1 + 1;
        let height = ourBounds.y2 - ourBounds.y1 + 1;

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
            let next = this.sections[index];
            let nextBounds = next.bounds;
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

        let bounds = {x1: 1024, y1: 1024, x2: -1, y2: -1};

        let check = (x: number, y: number): void => {
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
            let next = this.sections[index];
            let x1 = next.x;
            let y1 = next.y;
            let x2 = x1 + next.width - 1;
            let y2 = y1 + next.height - 1;
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

        let newArray = [];

        for (let index = 0; index < this.sections.length; index++) {

            let next = this.sections[index];
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
        let toReturn: MapSection[] = [];
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

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
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

/**
 * The <i>MapSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapSection {

    readonly bounds: MapArea;
    readonly array: boolean[][];
    readonly negate: boolean;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;

    /**
     * Main constructor.
     *
     * @param x
     * @param y
     * @param array
     * @param invert
     */
    protected constructor(x: number, y: number, array: boolean[][], invert: boolean = false) {
        this.x = x;
        this.y = y;
        this.array = array;
        this.width = array.length;
        this.height = array[0].length;
        this.negate = invert;
        this.bounds = new MapArea(CoordinateType.TILE, x, y, x + this.width - 1, y + this.height - 1);
    }

    clone(): MapSection {

        // Deep-clone the array.
        let array: boolean[][] = [];
        for (let x = 0; x < this.width; x++) {
            array[x] = [];
            for (let y = 0; y < this.height; y++) {
                array[x][y] = this.array[x][y];
            }
        }

        return new MapSection(this.x, this.y, array, this.negate);
    }

    move(x: number, y: number): MapSection {

        let x1 = this.x + x;
        let y1 = this.y + y;
        let x2 = x1 + this.width - 1;
        let y2 = y1 + this.height - 1;

        if (x1 > 1023 || y1 > 1023 || x2 < 0 || y2 < 0) {
            return null;
        }

        let chopTop = y1 < 0;
        let chopLeft = x1 < 0;

        if (x1 < 0) {
            x1 = 0;
        }
        if (y1 < 0) {
            y1 = 0;
        }
        if (x2 > 1023) {
            x2 = 1023;
        }
        if (y2 > 1023) {
            y2 = 1023;
        }

        let calcWidth = x2 - x1 + 1;
        let calcHeight = y2 - y1 + 1;

        let xOffset = chopLeft ? -x1 : 0;
        let yOffset = chopTop ? -y1 : 0;

        let array: boolean[][] = [];
        for (let x = 0; x < calcWidth; x++) {
            array[x] = [];
            for (let y = 0; y < calcHeight; y++) {
                array[x][y] = this.array[x + xOffset][y + yOffset];
            }
        }

        return new MapSection(x1, y1, array, this.negate);
    }

    test(gx: number, gy: number): boolean {

        if (!this.contains(gx, gy)) {
            return false;
        }

        let result = this.array[gx - this.bounds.x1][gy - this.bounds.y1];
        return !this.negate ? result : !result;
    }

    contains(x: number, y: number): boolean {
        return this.bounds.contains(x, y);
    }

    /**
     * Creates a boxed MapSection.
     *
     * @param x1 The 'X' coordinate. (Also the top-left 'X' coordinate)
     * @param y1 The 'Y' coordinate. (Also the top-left 'Y' coordinate)
     * @param x2 The bottom-right 'X' coordinate. (Optional)
     * @param y2 The bottom-right 'Y' coordinate. (Optional)
     * @param invert
     */
    static box(x1: number, y1: number, x2: number = null, y2: number = null, invert: boolean = false): MapSection {

        let xMin = Math.min(x1, x2);
        let yMin = Math.min(y1, y2);
        let xMax = Math.max(x1, x2);
        let yMax = Math.max(y1, y2);
        let width = xMax - xMin + 1;
        let height = yMax - yMin + 1;

        let array = new Array(width);
        for (let x = 0; x < width; x++) {
            array[x] = new Array(height);
            for (let y = 0; y < height; y++) {
                array[x][y] = true;
            }
        }

        return new MapSection(xMin, yMin, array, invert);
    }

    static isPositive(sections: MapSection[], point: MapPoint): boolean {

        // If there are no sections to check, no space is positive.
        if (sections.length === 0) {
            return false;
        }

        // Make sure the coordinate type is set to tile.
        if (point.type !== CoordinateType.TILE) {
            point = point.asType(CoordinateType.TILE);
        }

        let result = false;
        for (let index = 0; index < sections.length; index++) {
            let next = sections[index];
            if (next.contains(point.x, point.y)) {
                if (next.test(point.x, point.y)) {
                    result = !next.negate;
                } else {
                    result = false;
                }
            }
        }

        return result;
    }

    static bounds(sections: MapSection[], positiveOnly: boolean = true): MapArea {
        let x1 = 1024, y1 = 1024;
        let x2 = -1, y2 = -1;

        for (let index = 0; index < sections.length; index++) {

            let next = sections[index];

            // If only positive space is requested for boundaries, ignore inverted
            //   sections.
            if (positiveOnly && next.negate) {
                continue;
            }

            let nx1 = next.x;
            let ny1 = next.y;
            let nx2 = next.x + next.width - 1;
            let ny2 = next.y + next.height - 1;

            if (nx1 < x1) {
                x1 = nx1;
            }
            if (ny1 < y1) {
                y1 = ny1;
            }
            if (nx2 < x1) {
                x1 = nx2;
            }
            if (ny2 < y1) {
                y1 = ny2;
            }

            if (nx1 > x2) {
                x2 = nx1;
            }
            if (ny1 > y2) {
                y2 = ny1;
            }
            if (nx2 > x2) {
                x2 = nx2;
            }
            if (ny2 > y2) {
                y2 = ny2;
            }
        }

        return new MapArea(CoordinateType.TILE, x1, y1, x2, y2);
    }
}

