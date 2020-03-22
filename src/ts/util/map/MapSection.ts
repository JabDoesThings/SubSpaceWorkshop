import { Dirtable } from '../Dirtable';

export class MapSections implements Dirtable {

    readonly sections: MapSection[];

    private dirty: boolean;
    private array: boolean[][];
    private bounds: { x1: number; y1: number; x2: number; y2: number };

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

        let bounds = this.getBounds();

        // Grab dimensions.
        let width = (bounds.x2 - bounds.x1) + 1;
        let height = (bounds.y2 - bounds.y1) + 1;

        // Create the map.
        this.array = new Array(width);
        for (let index = 0; index < width; index++) {
            this.array[index] = new Array(height);
        }

        // Populate the map.
        for (let index = 0; index < this.sections.length; index++) {
            let next = this.sections[index];
            for (let y = next.y1; y <= next.y2; y++) {
                for (let x = next.x1; x <= next.x2; x++) {
                    this.array[x - bounds.x1][y - bounds.y1] = !next.invert;
                }
            }
        }

        return this.array;
    }

    getBounds(): { x1: number, y1: number, x2: number, y2: number } {

        if (this.bounds != null) {
            return this.bounds;
        }

        if (this.sections.length === 0) {
            return null;
        }

        this.bounds = {x1: 1024, y1: 1024, x2: -1, y2: -1};

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
            check(next.x1, next.y1);
            check(next.x2, next.y2);
        }

        return this.bounds;
    }

    push(section: MapSection): void {

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

    clearSelections(): void {
        this.sections.length = 0;
        this.dirty = true;
        this.bounds = null;
        this.array = null;
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

export class MapSection {

    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
    readonly invert: boolean;

    /**
     * Main constructor.
     *
     * @param x1 The 'X' coordinate. (Also the top-left 'X' coordinate)
     * @param y1 The 'Y' coordinate. (Also the top-left 'Y' coordinate)
     * @param x2 The bottom-right 'X' coordinate. (Optional)
     * @param y2 The bottom-right 'Y' coordinate. (Optional)
     */
    constructor(x1: number, y1: number, x2: number = null, y2: number = null, invert: boolean = false) {

        this.x1 = x1;
        this.y1 = y1;

        if (x2 == null) {
            x2 = x1;
        }
        if (y2 == null) {
            y2 = y1;
        }

        this.x2 = x2;
        this.y2 = y2;
        this.invert = invert;
    }
}
