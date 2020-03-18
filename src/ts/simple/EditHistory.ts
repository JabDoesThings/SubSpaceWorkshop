import { CompiledLVZMapObject, LVZDisplayMode, LVZPackage, LVZRenderLayer } from '../io/LVZ';
import { Session } from './Session';

/**
 * The <i>EditHistory</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditHistory {

    static readonly EDITOR_HISTORY_LIMIT = 32;

    readonly session: Session;
    edits: Edit[][];

    private index = 0;

    /**
     * Main constructor.
     *
     * @param session The session instance.
     */
    constructor(session: Session) {

        this.session = session;

        this.edits = [];
        this.index = -1;
    }

    /**
     * Executes edits, filing them into the history of the editor.
     *
     * @param edits The edits to execute.
     */
    execute(edits: Edit[]): void {

        if (edits.length === 0) {
            console.warn("The edits array given is empty. There are no edits to execute. Ignoring..");
            return;
        }

        if (this.edits.length === 0) {
            this.index = -1;
        } else if (this.edits.length == EditHistory.EDITOR_HISTORY_LIMIT) {

            this.edits = this.edits.reverse();
            this.edits.pop();
            this.edits = this.edits.reverse();
        } else {

            // If an action is done after previous are undone, remove the actions
            //   in-front of it before proceeding.
            while (this.edits.length > this.index + 1) {
                this.edits.pop();
            }
        }

        this.edits.push(edits);
        this.redo();
    }

    /**
     * Redoes the history of the session.
     *
     * @throws Error Thrown if the history is already at the latest edit.<br/>
     * <b>NOTE</b>: Use {@link EditHistory#canRedo() canRedo()} to check if redo is possible.
     */
    redo(): void {

        // Make sure that the edit history isn't set at the latest edit.
        if (this.index >= this.edits.length - 1) {
            throw new Error("Cannot redo. The session's edit history is already at the most recent edit.");
        }

        this.index++;
        let edits = this.edits[this.index];

        for (let index = 0; index < edits.length; index++) {
            try {
                edits[index].redo(this);
            } catch (e) {
                console.error("Failed to redo edit.");
                console.error(e);
            }
        }
    }

    /**
     * Undoes the history of the session.
     *
     * @throws Error Thrown if the history is already at the earliest edit.<br/>
     * <b>NOTE</b>: Use {@link EditHistory#canUndo() canUndo()} to check if undo is possible.
     */
    undo(): void {

        if (this.index <= 0) {
            throw new Error("Cannot undo. The session's edit history is already reached.");
        }

        let edits = this.edits[this.index];

        for (let index = 0; index < edits.length; index++) {
            try {
                edits[index].undo(this);
            } catch (e) {
                console.error("Failed to undo edit.");
                console.error(e);
            }
        }

        this.index--;
    }

    /**
     * @return Returns true if the editor can undo edits.
     */
    canUndo(): boolean {
        return this.index > 0;
    }

    /**
     * @return Returns true if the editor can redo edits.
     */
    canRedo(): boolean {
        return this.index < this.edits.length - 1;
    }
}

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
    abstract redo(history: EditHistory): void;

    /**
     * Undoes the edit.
     *
     * @param history The history of the session.
     */
    abstract undo(history: EditHistory): void;
}

/**
 * The <i>EditTile</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditTileTransform extends Edit {

    readonly transform: LVLMapTileProperties;

    originalTransform: LVLMapTileProperties;
    idPrevious: number;

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     * @param transform
     */
    constructor(layer: number, transform: LVLMapTileProperties) {

        super(layer);

        this.transform = transform;
    }

    // @Override
    redo(history: EditHistory): void {

        let map = history.session.map;
        if (this.originalTransform == null) {
            let x = this.transform.x;
            let y = this.transform.y;
            let originalId = map.getTile(this.transform.x, this.transform.y);
            this.originalTransform = {x: x, y: y, id: originalId};
        }

        map.setTile(this.transform.x, this.transform.y, this.transform.id);
    }

    // @Override
    undo(history: EditHistory): void {

        let map = history.session.map;

        if (this.idPrevious == null) {
            throw new Error("The previous ID is not set and the action cannot be undone.");
        }

        map.setTile(this.originalTransform.x, this.originalTransform.y, this.originalTransform.id);
    }
}

/**
 * The <i>EditMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class EditMapObject extends Edit {

    readonly lvzPackage: LVZPackage;
    readonly object: CompiledLVZMapObject;

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     * @param lvzPackage
     * @param object
     */
    protected constructor(layer: number, lvzPackage: LVZPackage, object: CompiledLVZMapObject) {

        super(layer);

        this.lvzPackage = lvzPackage;
        this.object = object;
    }
}

/**
 * The <i>EditMapObjectAdd</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditMapObjectAdd extends EditMapObject {

    /**
     * Main constructor.
     *
     * @param layer
     * @param lvzPackage
     * @param object
     */
    constructor(layer: number, lvzPackage: LVZPackage, object: CompiledLVZMapObject) {
        super(layer, lvzPackage, object);
    }

    // @Override
    redo(history: EditHistory): void {
        this.lvzPackage.addMapObject(this.object);
    }

    // @Override
    undo(history: EditHistory): void {
        this.lvzPackage.removeMapObject(this.object);
    }
}

/**
 * The <i>EditMapObjectRemove</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditMapObjectRemove extends EditMapObject {

    /**
     * Main constructor.
     *
     * @param layer
     * @param lvzPackage
     * @param object
     */
    constructor(layer: number, lvzPackage: LVZPackage, object: CompiledLVZMapObject) {
        super(layer, lvzPackage, object);
    }

    // @Override
    redo(history: EditHistory): void {
        this.lvzPackage.removeMapObject(this.object);
    }

    // @Override
    undo(history: EditHistory): void {
        this.lvzPackage.addMapObject(this.object);
    }
}

/**
 * The <i>EditMapObjectTransform</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditMapObjectTransform extends EditMapObject {

    readonly object: CompiledLVZMapObject;
    readonly transform: LVZMapObjectProperties;

    originalTransform: LVZMapObjectProperties;

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     * @param lvzPackage
     * @param object
     * @param transform
     */
    constructor(layer: number, lvzPackage: LVZPackage, object: CompiledLVZMapObject, transform: LVZMapObjectProperties) {

        super(layer, lvzPackage, object);

        this.transform = transform;
    }

    // @Override
    redo(history: EditHistory): void {
        if (this.originalTransform == null) {
            this.originalTransform = {
                x: this.object.x,
                y: this.object.y,
                id: this.object.id,
                layer: this.object.layer,
                mode: this.object.mode,
                time: this.object.time
            };
        }

        this.object.x = this.transform.x;
        this.object.y = this.transform.y;
        this.object.id = this.transform.id;
        this.object.layer = this.transform.layer;
        this.object.mode = this.transform.mode;
        this.object.time = this.transform.time;
    }

    // @Override
    undo(history: EditHistory): void {

        if (this.originalTransform == null) {
            throw new Error("The original transform is not defined and cannot be redone.");
        }

        this.object.x = this.originalTransform.x;
        this.object.y = this.originalTransform.y;
        this.object.id = this.originalTransform.id;
        this.object.layer = this.originalTransform.layer;
        this.object.mode = this.originalTransform.mode;
        this.object.time = this.originalTransform.time;
    }
}

/**
 * The <i>LVZMapObjectProperties</i> interface. TODO: Documen.
 *
 * @author Jab
 */
export interface LVZMapObjectProperties {
    x: number,
    y: number,
    id: number,
    layer: LVZRenderLayer,
    mode: LVZDisplayMode,
    time: number
}

/**
 * The <i>LVLMapTileProperties</i> interface. TODO: Documen.
 *
 * @author Jab
 */
export interface LVLMapTileProperties {
    x: number,
    y: number,
    id: number
}
