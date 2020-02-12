/**
 * The <i>Updatable</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface Updatable {

    /**
     * Call this to update the object.
     */
    update(delta: number): void;

    /**
     * Fired when the object updates.
     */
    onUpdate(delta: number): boolean;

}
