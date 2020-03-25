import { Edit } from './Edit';
import { EditManager } from '../EditManager';
import { MapSection } from '../../util/map/MapSection';

export class EditSelectionAdd extends Edit {

    private readonly selections: MapSection[];

    private done: boolean;

    constructor(selections: MapSection[]) {

        super();

        this.selections = selections;

        this.done = false;
    }

    do(history: EditManager): void {

        if (this.done) {
            throw new Error("The selection are already added.");
        }

        for (let index = 0; index < this.selections.length; index++) {
            history.project.selections.add(this.selections[index]);
        }

        this.done = true;
    }

    undo(history: EditManager): void {

        if (!this.done) {
            throw new Error("The selections are not added.");
        }

        for (let index = this.selections.length - 1; index >= 0; index--) {
            history.project.selections.remove(this.selections[index]);
        }

        this.done = false;
    }
}
