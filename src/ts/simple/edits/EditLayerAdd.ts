import { Edit } from './Edit';
import { EditManager } from '../EditManager';
import { Layer } from '../layers/Layer';

export class EditLayerAdd extends Edit {

    private readonly layer: Layer;

    private done: boolean;

    constructor(layer: Layer) {
        super();

        this.done = false;
        this.layer = layer;
    }

    do(history: EditManager): void {
        if(this.done) {
            throw new Error('The layer is already added: ' + this.layer.getName() + "'");
        }
        history.project.layers.add(this.layer);
        this.done = true;
    }

    undo(history: EditManager): void {
        if(!this.done) {
            throw new Error('The layer is not added: ' + this.layer.getName() + "'");
        }
        history.project.layers.remove(this.layer);
        this.done = false;
    }

}
