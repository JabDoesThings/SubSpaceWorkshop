import { Edit } from './Edit';
import { EditManager } from '../EditManager';
import { MapSection, MapSections } from '../../util/map/MapSection';

/**
 * The <i>EditClearSelections</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditClearSelections extends Edit {

    private selections: MapSection[];
    private done: boolean;

    /**
     * Main constructor.
     *
     * @param layer
     */
    constructor(layer: number) {

        super(layer);

        this.selections = null;
        this.done = false;
    }

    // @Override
    do(history: EditManager): void {

        if (this.done) {
            throw new Error("The selection is already removed.");
        }

        this.selections = history.session.map.selections.clear();

        this.done = true;
    }

    // @Override
    undo(history: EditManager): void {

        if (!this.done) {
            throw new Error("The selection is not removed.");
        }

        history.session.map.selections.addAll(this.selections);

        this.selections = null;
        this.done = false;
    }
}
