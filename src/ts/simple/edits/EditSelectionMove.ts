import { Edit } from './Edit';
import { EditManager } from '../EditManager';
import { MapSection } from '../../util/map/MapSection';

/**
 * The <i>EditSelectionMove</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditSelectionMove extends Edit {

    private readonly x: number;
    private readonly y: number;

    private sections: MapSection[];

    /**
     * Main constructor.
     *
     * @param x The 'X' offset. (In tiles)
     * @param y The 'Y' offset. (In tiles)
     */
    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }

    // @Override
    do(history: EditManager): void {

        if(this.sections != null) {
            throw new Error('The edit is already done.');
        }

        // Deep clone all selections to reset if undone.
        this.sections = [];
        let originalSections = history.project.selections.sections;
        for(let index = 0; index < originalSections.length; index++) {
            this.sections.push(originalSections[index].clone());
        }

        history.project.selections.move(this.x, this.y);
    }

    // @Override
    undo(history: EditManager): void {

        if(this.sections == null) {
            throw new Error('The edit is not done.');
        }

        history.project.selections.clear();
        history.project.selections.addAll(this.sections);
        this.sections = null;
    }
}
