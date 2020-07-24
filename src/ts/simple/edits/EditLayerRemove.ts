import { Edit } from './Edit';
import { EditManager } from '../EditManager';
import { Layer } from '../layers/Layer';

/**
 * The <i>EditLayerRemove</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditLayerRemove extends Edit {

  private readonly layer: Layer;
  private parent: Layer;
  private done: boolean;
  private wasActive: boolean;
  private index: number;

  /**
   * @constructor
   *
   * @param {Layer} layer The layer to remove.
   */
  constructor(layer: Layer) {
    super();
    this.done = false;
    this.layer = layer;
  }

  /** @override */
  do(history: EditManager): void {
    if (this.done) {
      throw new Error('The layer is already removed: ' + this.layer.getName() + "'");
    }
    const layers = history.project.layers;
    if (layers.active === this.layer) {
      this.wasActive = true;
    }
    if (this.layer.hasParent()) {
      this.parent = this.layer.getParent();
      this.index = this.parent.removeChild(this.layer);
    } else {
      // Store the index of the layer when removed so if it is undone, the layer will
      //   be inserted into the previous spot it was in.
      this.index = history.project.layers.remove(this.layer);
    }
    this.done = true;
  }

  /** @override */
  undo(history: EditManager): void {
    if (!this.done) {
      throw new Error('The layer is not removed: ' + this.layer.getName() + "'");
    }
    const layers = history.project.layers;
    layers.set(this.index, this.layer);
    if (this.wasActive) {
      layers.setActive(this.layer);
    }
    this.wasActive = false;
    this.index = null;
    this.done = false;
  }
}
