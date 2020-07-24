import { Edit } from './Edit';
import { EditManager } from '../EditManager';
import { Layer } from '../layers/Layer';

/**
 * The <i>EditLayerAdd</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditLayerAdd extends Edit {

  private readonly layer: Layer;
  private readonly setActive: boolean;
  private lastActive: Layer;
  private done: boolean;

  /**
   * @constructor
   *
   * @param {Layer} layer
   * @param {boolean} setActive
   */
  constructor(layer: Layer, setActive: boolean) {
    super();
    this.done = false;
    this.layer = layer;
    this.setActive = setActive;
  }

  /** @override */
  do(history: EditManager): void {
    if (this.done) {
      throw new Error('The layer is already added: ' + this.layer.getName() + "'");
    }
    let layers = history.project.layers;
    if (layers.active != null) {
      this.lastActive = layers.active;
    }
    history.project.layers.add(this.layer, this.setActive);
    this.done = true;
  }

  /** @override */
  undo(history: EditManager): void {
    if (!this.done) {
      throw new Error('The layer is not added: ' + this.layer.getName() + "'");
    }
    let layers = history.project.layers;
    layers.remove(this.layer);
    if (this.lastActive != null) {
      layers.setActive(this.lastActive);
    }
    this.lastActive = null;
    this.done = false;
  }
}
