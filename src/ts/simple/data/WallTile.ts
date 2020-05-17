import uuid = require('uuid');
import { Project } from '../Project';
import { Dirtable } from '../../util/Dirtable';

export class WallTiles implements Dirtable {

    private profiles: { [id: string]: WallTile };

    private readonly project: Project;

    private dirty: boolean;

    constructor(project: Project) {
        this.project = project;
        this.dirty = true;
    }

    preUpdate(): void {
        for (let id in this.profiles) {
            this.profiles[id].preUpdate();
        }
    }

    update(): void {
        for (let id in this.profiles) {
            this.profiles[id].update();
        }
    }

    postUpdate(): void {

        for (let id in this.profiles) {
            this.profiles[id].postUpdate();
        }

        this.setDirty(false);
    }

    add(wallTile: WallTile): void {
        this.profiles[wallTile.getId()] = wallTile;
    }

    remove(wallTile: WallTile | string): void {
        if (typeof wallTile === 'string') {
            this.profiles[wallTile] = undefined;
        } else {
            this.profiles[wallTile.getId()] = undefined;
        }
    }

    clear(): void {
        this.profiles = {};
    }

    getProfiles(): { [id: string]: WallTile } {
        return this.profiles;
    }

    // @Override
    isDirty(): boolean {

        if (this.dirty) {
            return true;
        }

        for (let id in this.profiles) {
            if (this.profiles[id].isDirty()) {
                return true;
            }
        }

        return false;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }
}

/**
 * The <i>WallTile</i> class. TODO: Document.
 *
 * @author Jab
 */
export class WallTile implements Dirtable {

    private readonly sets: WallSet[];
    private readonly id: string;

    private dirty: boolean;

    /**
     * Main constructor.
     */
    constructor(id: string = null) {

        // Make sure the WallTile has an ID.
        if (id == null) {
            id = uuid.v4();
        }

        this.id = id;
        this.sets = [];
        this.dirty = true;
    }

    preUpdate(): void {
        if (this.sets.length !== 0) {
            for (let index = 0; index < this.sets.length; index++) {
                this.sets[index].preUpdate();
            }
        }
    }

    update(): void {
        if (this.sets.length !== 0) {
            for (let index = 0; index < this.sets.length; index++) {
                this.sets[index].update();
            }
        }
    }

    postUpdate(): void {
        this.setDirty(false);

        if (this.sets.length !== 0) {
            for (let index = 0; index < this.sets.length; index++) {
                this.sets[index].postUpdate();
            }
        }
    }

    addSet(set: WallSet): void {

        if (set == null) {
            throw new Error('The WallSet given is null or undefined.');
        }

        this.sets.push(set);
    }

    removeSet(set: WallSet): void {

        if (set == null) {
            throw new Error('The WallSet given is null or undefined.');
        }

        if (this.sets.length === 0) {
            return;
        }

        let newArray: WallSet[] = [];

        for (let index = 0; index < this.sets.length; index++) {
            let next = this.sets[index];
            if (next === set) {
                continue;
            }
            newArray.push(next);
        }

        this.sets.length = 0;

        if (newArray.length === 0) {
            return;
        }

        for (let index = 0; index < newArray.length; index++) {
            this.sets.push(newArray[index]);
        }
    }

    contains(set: WallSet): boolean {

        if (set == null) {
            throw new Error('The WallSet given is null or undefined.');
        }

        if (this.sets.length === 0) {
            return false;
        }

        for (let index = 0; index < this.sets.length; index++) {
            if (this.sets[index] === set) {
                return true;
            }
        }
        return false;
    }

    getSets(): WallSet[] {
        return this.sets;
    }

    size(): number {
        return this.sets.length;
    }

    clear(): void {
        this.sets.length = 0;
    }

    getId(): string {
        return this.id;
    }

    // @Override
    isDirty(): boolean {

        if (this.dirty) {
            return true;
        }

        if (this.sets.length !== 0) {
            for (let index = 0; index < this.sets.length; index++) {
                if (this.sets[index].isDirty()) {
                    return true;
                }
            }
        }

        return false;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }
}

/**
 * The <i>WallSet</i> class. TODO: Document.
 *
 * @author Jab
 */
export class WallSet implements Dirtable {

    private readonly tiles: number[];

    private dirty: boolean;

    constructor() {

        // Create empty array for tile IDs.
        this.tiles = [];
        for (let offset = 0; offset < 16; offset++) {
            this.tiles[offset] = 0;
        }

        this.dirty = true;
    }

    preUpdate(): void {

    }

    update(): void {

    }

    postUpdate(): void {
        this.setDirty(false);
    }

    getTile(offset: WallTileType): number {

        if (offset == null) {
            throw new Error('The offset given is null or undefined.');
        } else if (offset < 0) {
            throw new Error('The offset given is negative. Offsets can only be between 0 and 15.');
        } else if (offset > 15) {
            throw new Error('The offset given is greater than 15. Offsets can only be between 0 and 15.');
        }

        return this.tiles[offset];
    }

    setTile(offset: WallTileType, id: number): void {

        if (offset == null) {
            throw new Error('The offset given is null or undefined.');
        } else if (offset < 0) {
            throw new Error('The offset given is negative. Offsets can only be between 0 and 15.');
        } else if (offset > 15) {
            throw new Error('The offset given is greater than 15. Offsets can only be between 0 and 15.');
        }

        if (id == null) {
            throw new Error('The tile ID given is null or undefined.');
        } else if (id < 0) {
            throw new Error('The tile ID given is negative. Tile IDs can only be between 1 and 255.');
        } else if (id > 255) {
            throw new Error('The tile ID given is greater than 255. Tile IDs can only be between 1 and 255.');
        }

        this.tiles[offset] = id;
        this.setDirty(true);
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
 * The <i>WallTileType</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum WallTileType {
    TOP_LEFT_CORNER = 0,
    TOP_JUNCTION = 1,
    TOP_RIGHT_CORNER = 2,
    VERTICAL_CAP_TOP = 3,
    LEFT_JUNCTION = 4,
    CENTER = 5,
    RIGHT_JUNCTION = 6,
    VERTICAL = 7,
    BOTTOM_LEFT_CORNER = 8,
    BOTTOM_JUNCTION = 9,
    BOTTOM_RIGHT_CORNER = 10,
    VERTICAL_CAP_BOTTOM = 11,
    HORIZONTAL_CAP_LEFT = 12,
    HORIZONTAL = 13,
    HORIZONTAL_CAP_RIGHT = 14,
    SINGLE = 15
}
