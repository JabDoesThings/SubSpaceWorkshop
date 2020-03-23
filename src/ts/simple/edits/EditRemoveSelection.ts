import { Edit } from './Edit';
import { EditManager } from '../EditManager';
import { MapSection, MapSections } from '../../util/map/MapSection';

export class EditRemoveSelection extends Edit {

    private readonly selections: MapSection[];

    private done: boolean;

    constructor(layer: number, selections: MapSection[]) {

        super(layer);

        this.selections = selections;
        this.done = false;
    }

    do(history: EditManager): void {

        if (this.done) {
            throw new Error("The selection is already removed.");
        }

        for (let index = 0; index < this.selections.length; index++) {
            history.session.map.selections.remove(this.selections[index]);
        }

        this.done = true;
    }

    undo(history: EditManager): void {

        if (!this.done) {
            throw new Error("The selection is not removed.");
        }

        for (let index = this.selections.length - 1; index >= 0; index--) {
            history.session.map.selections.add(this.selections[index]);
        }

        this.done = false;
    }
}
