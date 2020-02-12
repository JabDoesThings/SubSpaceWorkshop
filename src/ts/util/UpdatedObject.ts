import { Dirtable } from './Dirtable';
import { UniqueObject } from './UniqueObject';

/**
 * The <i>UpdatedObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class UpdatedObject extends UniqueObject implements Dirtable {

    private dirty: boolean;

    private dirtyUpdate: boolean;

    /**
     * Main constructor.
     */
    protected constructor(name: string, id: string = null) {

        super(name, id);

        this.dirty = false;
        this.dirtyUpdate = true;

    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    /**
     * Call this to update the object.
     *
     * <p><b>NOTE:</b> The object will only update when it is dirty.
     */
    public update(delta: number): void {

        // Update the object only if it is dirty.
        if (!this.requireDirtyToUpdate() || this.isDirty()) {

            let result: boolean = this.onUpdate(delta);

            if (this.requireDirtyToUpdate()) {

                // Reset the dirty state of the object after updating successfully.
                this.setDirty(!result);

            }

        }

    }

    public requireDirtyToUpdate(): boolean {
        return this.dirtyUpdate;
    }

    public setRequireDirtyToUpdate(flag: boolean): void {
        this.dirtyUpdate = flag;
    }

    /**
     * Fired when the object updates from being dirty.
     *
     * @return Return 'true' if the update is successful.
     */
    protected abstract onUpdate(delta: number): boolean;

}
