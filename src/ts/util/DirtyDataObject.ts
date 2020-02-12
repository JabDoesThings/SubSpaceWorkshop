import { UniqueObject } from './UniqueObject';
import { Dirtable } from './Dirtable';
import { Updatable } from './Updatable';

/**
 * The <i>DirtyDataObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class DirtyDataObject extends UniqueObject implements Dirtable, Updatable {

    private dirty: boolean;

    /**
     * Main constructor.
     *
     * @param name The name of the object.
     * @param id The ID of the object.
     */
    protected constructor(name: string, id: string = null) {
        super(name, id);
        this.dirty = false;
    }

    // @Override
    public update(delta: number): void {

        // Update the object only if it is dirty.
        if (this.isDirty()) {
            let result = this.onUpdate(delta);
            if (result) {
                this.setDirty(false);
            }
        }

    }

    // @Override
    public isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    public setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    // @Override
    abstract onUpdate(delta: number): boolean;
}
