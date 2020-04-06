import { Edit } from './Edit';
import { EditManager } from '../EditManager';
import { Layer } from '../layers/Layer';

/**
 * The <i>EditLayerVisible</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditLayerVisible extends Edit {

    private readonly layer: Layer;
    private readonly visible: boolean;

    /**
     * Main constructor.
     *
     * @param layer
     * @param visible
     */
    constructor(layer: Layer, visible: boolean) {
        super();
        this.layer = layer;
        this.visible = visible;
    }

    // @Override
    do(history: EditManager): void {
        this.layer.setVisible(this.visible);
    }

    // @Override
    undo(history: EditManager): void {
        this.layer.setVisible(!this.visible);
    }
}
