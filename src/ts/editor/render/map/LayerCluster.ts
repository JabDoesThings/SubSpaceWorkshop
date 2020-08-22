import * as PIXI from 'pixi.js';

/**
 * The <i>LayerCluster</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class LayerCluster {
  readonly layers: PIXI.Container[] = [];

  constructor() {
    for (let index = 0; index < 8; index++) {
      let layer = new PIXI.Container();
      layer.sortableChildren = false;
      layer.sortDirty = false;
      layer.interactive = false;
      layer.interactiveChildren = false;
      this.layers.push(layer);
    }
  }

  clear(): void {
    for (let index = 0; index < 8; index++) {
      this.layers[index].removeChildren();
    }
  }
}
