import { Dirtable } from '../Dirtable';

/**
 * The <i>MapSections</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapSections implements Dirtable {

    sections: MapSection[];

    private dirty: boolean;
    private array: boolean[][];
    private bounds: Boundary;
    private rectangles: Boundary[];

    /**
     * Main constructor.
     */
    constructor() {

        this.sections = [];

        this.dirty = true;
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
                    this.array[x - x1][y - y1] = !next.invert;
                }
            }
        }

        return this.array;
    }

    getBounds(): Boundary {

        if (this.bounds != null) {
            return this.bounds;
        }

        if (this.sections.length === 0) {
            return null;
        }

        this.bounds = new Boundary(1024, 1024, -1, -1);

        let check = (x: number, y: number): void => {
            if (this.bounds.x1 > x) {
                this.bounds.x1 = x;
            }
            if (this.bounds.x2 < x) {
                this.bounds.x2 = x;
            }
            if (this.bounds.y1 > y) {
                this.bounds.y1 = y;
            }
            if (this.bounds.y2 < y) {
                this.bounds.y2 = y;
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
        this.dirty = true;
        this.bounds = null;
        this.array = null;
    }

    addAll(sections: MapSection[]) {
        for(let index = 0; index < sections.length; index++) {
            this.sections.push(sections[index]);
        }
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

        this.dirty = true;
        this.bounds = null;
        this.array = null;
    }

    clear(): MapSection[] {

        // Copy the existing array to return.
        let toReturn: MapSection[] = [];
        for (let index = 0; index < this.sections.length; index++) {
            toReturn.push(this.sections[index]);
        }

        this.sections = [];
        this.dirty = true;
        this.bounds = null;
        this.array = null;

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
        this.dirty = flag;
    }
}

/**
 * The <i>MapSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapSection {

    readonly bounds: Boundary;
    readonly array: boolean[][];
    readonly invert: boolean;
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
        this.invert = invert;
        this.bounds = new Boundary(x, y, x + this.width - 1, y + this.height - 1);
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
}

/**
 * The <i>Boundary</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Boundary {

    x1: number;
    y1: number;
    x2: number;
    y2: number;

    /**
     * Main constructor.
     *
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     */
    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}
