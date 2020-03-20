import { EditManager } from '../EditManager';

/**
 * The <i>Edit</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class Edit {

    protected layer: number;

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     */
    protected constructor(layer: number) {
        this.layer = layer;
    }

    /**
     * Redoes the edit.
     *
     * @param history The history of the session.
     */
    abstract do(history: EditManager): void;

    /**
     * Undoes the edit.
     *
     * @param history The history of the session.
     */
    abstract undo(history: EditManager): void;
}
