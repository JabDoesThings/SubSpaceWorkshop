import { CustomEvent, CustomEventListener } from './ui/CustomEventListener';
import { CompiledLVZScreenObject, LVZPackage } from '../io/LVZ';
import { LVZ } from '../io/LVZUtils';

/**
 * The <i>LVZManager</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZManager extends CustomEventListener<LVZEvent> {

    packages: LVZPackage[];
    lvzDirtyRange: { x1: number, y1: number, x2: number, y2: number };
    resourceDirty: boolean;
    loaded: boolean;
    dirty: boolean;

    /**
     * Main constructor.
     */
    constructor() {

        super();

        this.packages = [];
        this.lvzDirtyRange = {x1: 0, x2: 0, y1: 16384, y2: 16384};
        this.resourceDirty = false;
        this.loaded = false;
        this.dirty = true;
    }

    /**
     * Loads LVZ file paths.
     *
     * @param paths The paths to LVZ files to load.
     * @param override
     */
    load(paths: string[], override: boolean = false): void {

        if (!override && this.loaded) {
            return;
        }

        for (let index = 0; index < paths.length; index++) {
            let next = LVZ.read(paths[index]).inflate();
            this.packages.push(next);
        }

        this.loaded = true;
        this.dirty = true;
    }

    unload(): void {

        this.packages = [];
        this.setDirtyArea();

        this.loaded = false;
        this.dirty = true;
    }

    onPostUpdate(): void {

        if (this.dirty) {
            this.dirty = false;
            this.lvzDirtyRange.x1 = 999999;
            this.lvzDirtyRange.y1 = 999999;
            this.lvzDirtyRange.x2 = -999999;
            this.lvzDirtyRange.y2 = -999999;
        }

        if (this.resourceDirty) {
            this.resourceDirty = false;
        }
    }

    isDirty(x1: number = 0, y1: number = 0, x2: number = 16384, y2: number = 16384): boolean {
        let bx1 = this.lvzDirtyRange.x1;
        let by1 = this.lvzDirtyRange.y1;
        let bx2 = this.lvzDirtyRange.x2;
        let by2 = this.lvzDirtyRange.y2;
        return !(bx2 < x1 || bx1 > x2) && !(by2 < y1 || by1 > y2);
    }

    setDirtyPoint(x: number, y: number): void {
        this.dirty = true;
        if (this.lvzDirtyRange.x1 > x) {
            this.lvzDirtyRange.x1 = x;
        }
        if (this.lvzDirtyRange.y1 > y) {
            this.lvzDirtyRange.y1 = y;
        }
        if (this.lvzDirtyRange.x2 < x) {
            this.lvzDirtyRange.x2 = x;
        }
        if (this.lvzDirtyRange.y2 < y) {
            this.lvzDirtyRange.y2 = y;
        }
    }

    setDirtyArea(x1: number = 0, y1: number = 0, x2: number = 16384, y2: number = 16384): void {
        this.dirty = true;
        this.lvzDirtyRange.x1 = x1;
        this.lvzDirtyRange.y1 = y1;
        this.lvzDirtyRange.x2 = x2;
        this.lvzDirtyRange.y2 = y2;
    }

    getScreenObjects(): CompiledLVZScreenObject[] {

        let objects: CompiledLVZScreenObject[] = [];

        for (let index = 0; index < this.packages.length; index++) {

            let nextPkg = this.packages[index];
            if (nextPkg.screenObjects.length === 0) {
                continue;
            }

            for (let sIndex = 0; sIndex < nextPkg.screenObjects.length; sIndex++) {
                objects.push(nextPkg.screenObjects[sIndex]);
            }
        }

        return objects;
    }
}

export interface LVZEvent extends CustomEvent {
    packages: LVZPackage[],
    action: LVZAction
}

export enum LVZAction {
    LOAD_PACKAGES = 'load-packages',
    LOADED_PACKAGES = 'loaded-packages',
    UNLOAD_PACKAGES = 'unload-packages',
    UNLOADED_PACKAGES = 'unloaded-packages',
}
