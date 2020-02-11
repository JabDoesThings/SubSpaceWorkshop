import { Dirtable } from './Dirtable';

/**
 * The <i>DirtyObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class DirtyObject implements Dirtable {

    private dirty: boolean;

    /**
     * Main constructor.
     */
    protected constructor() {
        this.dirty = false;
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

