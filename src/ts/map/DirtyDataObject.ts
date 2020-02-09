import { DataObject } from './DataObject';

/**
 * The <i>DirtyDataObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class DirtyDataObject extends DataObject {

    private dirty: boolean;

    /**
     * Main constructor.
     *
     * @param name The name of the object.
     * @param id THe ID of the object.
     */
    constructor(name: string, id: string = null) {
        super(name, id);
        this.dirty = false;
    }

    /**
     * @return Returns 'true' if the object is dirty.
     */
    public isDirty(): boolean {
        return this.dirty;
    }

    /**
     * Sets the object's dirty state.
     *
     * @param flag The flag to set.
     */
    public setDirty(flag: boolean): void {
        this.dirty = flag;
    }

}
