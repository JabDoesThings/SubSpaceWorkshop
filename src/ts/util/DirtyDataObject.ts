import { UniqueObject } from './UniqueObject';
import { Dirtable } from './Dirtable';

/**
 * The <i>DirtyDataObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class DirtyDataObject extends UniqueObject implements Dirtable {

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

    /**
     * Call this to update the object.
     *
     * <p><b>NOTE:</b> The object will only update when it is dirty.
     */
    public update(): void {

        // Update the object only if it is dirty.
        if (this.isDirty()) {
            this.onUpdate();
            this.setDirty(false);
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

    /**
     * Fired when the object updates from being dirty.
     */
    protected abstract onUpdate(): void;

}
