import { Layer } from './Layer';
import { Project } from '../Project';
import { MapRenderer } from '../render/MapRenderer';
import { TileData } from '../../util/map/TileData';
import { TileRenderer } from '../render/TileRenderer';
import { MapArea } from '../../util/map/MapArea';
import { CoordinateType } from '../../util/map/CoordinateType';

/**
 * The <i>LayerManager</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LayerManager {

  readonly drawTileLayer: Layer;
  readonly layers: Layer[];
  readonly project: Project;
  private readonly _combinedTileRenderer: TileRenderer;
  private readonly _combinedTileData: TileData;
  private readonly _drawTileRenderer: TileRenderer;

  active: Layer;
  private updatingUI: boolean;

  /**
   * @constructor
   *
   * @param {Project} project
   */
  constructor(project: Project) {
    this.project = project;
    this.layers = [];
    this.active = null;
    this._combinedTileData = new TileData();
    this._combinedTileRenderer = new TileRenderer(project, this._combinedTileData);
    this.drawTileLayer = new Layer('default', 'drawTileLayer', 'drawTileLayer');
    this._drawTileRenderer = new TileRenderer(project, this.drawTileLayer.tiles);
    this.updatingUI = false;
  }

  updateUI(): void {
    if (this.updatingUI) {
      return;
    }
    this.updatingUI = true;

    const ui = this.project.editor.renderer.layersTab;
    ui.clear();

    for (let index = this.layers.length - 1; index >= 0; index--) {
      const next = this.layers[index];
      ui.addLayer(next.ui);
    }

    ui.updateElements();
    this.updatingUI = false;
  }

  /**
   * Adds a layer to the project.
   *
   * @param {Layer} layer The layer to add.
   * @param {boolean} setActive
   * @param {boolean} combine
   */
  add(layer: Layer, setActive: boolean = true, combine: boolean = true): void {
    layer.setManager(this);
    this.layers.push(layer);
    if (setActive) {
      this.active = layer;
    }
    if (combine) {
      this.combineTileLayers(true);
    }
    this.updateUI();
  }

  /**
   *
   * @param {number} index The index to insert the layer. If the index is greater than the last index
   *   of the registered layers in the root container, the layer will simply be appended.
   * @param {Layer} layer The layer to insert.
   * @param {boolean} setActive Flag to set whether or not the layer should be set active after being
   *   inserted.
   *
   * @throws {Error} Thrown if the following occurs: <br/>
   *  <uL>
   *      <li>The layer is alrady registered to the root container or is registered as
   *      a child to any parent layer that is registered.
   *      <li>The index given is negative.
   *      <li>The index given is null or undefined.
   *      <li>The layer given is null or undefined.
   *  <ul/>
   */
  set(index: number, layer: Layer, setActive: boolean = true): void {
    if (index == null) {
      throw new Error("The index given is null or undefined.");
    }
    if (layer == null) {
      throw new Error("The layer given is null or undefined.");
    }
    if (this.contains(layer, true)) {
      throw new Error("The layer given is already registered.");
    }
    if (index < 0) {
      throw new Error('Invalid index to set layer. (' + index + " given)");
    }

    layer.setManager(this);
    if (index > this.layers.length - 1) {
      this.add(layer, setActive);
      return;
    }
    // Copy the layer array.
    const newArray = [];
    for (let _index = 0; _index < this.layers.length; _index++) {
      // If we're on the index to insert, insert the layer to add first.
      if (_index === index) {
        newArray.push(layer);
      }
      // Normally push the next registered layer.
      newArray.push(this.layers[_index]);
    }
    // Repopulate the layers array with the inserted layer.
    this.layers.length = 0;
    for (let _index = 0; _index < newArray.length; _index++) {
      this.layers.push(newArray[_index]);
    }
  }

  /**
   * Removes a layer from the project.
   *
   * @param {Layer} layer The layer to remove.
   *
   * @return {number} Returns the original index of the removed layer. If the layer is not
   *   registered, -1 is returned.
   */
  remove(layer: Layer): number {
    layer.setManager(undefined);

    const isActiveRemoved = this.active === layer;
    let _index = -1;
    const toCopy = [];
    for (let index = 0; index < this.layers.length; index++) {
      const next = this.layers[index];
      if (next === layer) {
        _index = index;
        continue;
      }
      toCopy.push(next);
    }

    this.layers.length = 0;

    for (let index = 0; index < toCopy.length; index++) {
      const next = toCopy[index];
      this.layers.push(next);
    }

    if (isActiveRemoved) {
      if (this.layers.length === 0) {
        this.active = null;
      } else {
        this.active = this.layers[this.layers.length - 1];
      }
    }

    this.updateUI();
    return _index;
  }

  /**
   * Clears all layers from the project.
   *
   * @param {boolean} overrideLocked
   *
   * @return {Layer[]}
   */
  clear(overrideLocked: boolean): Layer[] {
    const toReturn = [];
    const toCopy = [];
    for (let index = 0; index < this.layers.length; index++) {
      const next = this.layers[index];
      if (!overrideLocked && next.isLocked()) {
        next.setManager(this);
        toCopy.push(next);
        continue;
      }
      toReturn.push(this.layers[index]);
    }

    this.layers.length = 0;
    if (toCopy.length !== 0) {
      for (let index = 0; index < toCopy.length; index++) {
        this.layers.push(toCopy[index]);
      }
    }
    this.updateUI();
    return toReturn;
  }

  /**
   * @param {Layer} layer The layer to test.
   * @param {boolean} deepSearch Set this to true to scan child layers.
   * @return {boolean} Returns true if the layer is in the project.
   */
  contains(layer: Layer, deepSearch: boolean = false): boolean {
    const check = (layers: Layer[]): boolean => {
      // Go through all layers and compare them and their children.
      for (let index = 0; index < layers.length; index++) {
        // The main layer
        const next = this.layers[index];
        if (next === layer) {
          return true;
        }
        // The layer's children.
        if (deepSearch && next.hasChildren()) {
          if (check(next.getChildren())) {
            return true;
          }
        }
      }
      // This level of recursion and below it did not match the layer given.
      return false;
    };
    return check(this.layers);
  }

  preUpdate(): void {
    if (this.layers.length !== 0) {
      for (let index = 0; index < this.layers.length; index++) {
        const layer = this.layers[index];
        layer.preUpdate();
        if (layer.isDirty()) {
          this.project.renderer.radar.setDirty(true);
        }
      }
    }
    this.drawTileLayer.preUpdate();
  }

  update(delta: number): void {
    let tileDirty = false;

    if (this.layers.length !== 0) {
      for (let index = 0; index < this.layers.length; index++) {
        const next = this.layers[index];
        if (next.isVisible()) {
          next.update(delta);
          if (next.isCacheDirty()) {
            tileDirty = true;
          }
        }
      }
    }

    if (tileDirty) {
      this.combineTileLayers(false);
    }
    this.drawTileLayer.update(delta);
  }

  postUpdate(): void {
    if (this.layers.length !== 0) {
      for (let index = 0; index < this.layers.length; index++) {
        this.layers[index].postUpdate();
      }
    }
    this._combinedTileRenderer.update(0);
    this._drawTileRenderer.update(0);
    this.drawTileLayer.postUpdate();
    this._combinedTileData.setDirty(false);
  }

  /**
   * @param {number} x The 'X' coordinate of the tile.
   * @param {number} y The 'Y' coordinate of the tile.
   *
   * @return {number} Returns the ID on the top-most layer (child-layer if applicable). If no tile data
   *   are available, -1 is returned.
   */
  getTile(x: number, y: number): number {
    if (this.layers.length === 0) {
      return -1;
    }
    for (let index = this.layers.length - 1; index >= 0; index--) {
      const layer = this.layers[index];
      if (!layer.isVisible()) {
        continue;
      }
      const tileId = layer.getTile(x, y);
      if (tileId > 0) {
        return tileId;
      }
    }
    return -1;
  }

  getCachedTile(x: number, y: number): number {
    return this._combinedTileData.get(x, y);
  }

  /** @override */
  isDirty(): boolean {
    if (this.layers.length === 0) {
      return false;
    }
    for (let index = this.layers.length - 1; index >= 0; index--) {
      if (this.layers[index].isDirty()) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {MapRenderer} renderer
   */
  onActivate(renderer: MapRenderer) {
    if (this.layers.length === 0) {
      return false;
    }
    this._combinedTileRenderer.onActivate(renderer);
    this._drawTileRenderer.onActivate(renderer);
    for (let index = 0; index < this.layers.length; index++) {
      this.layers[index].activate(renderer);
    }
    this.combineTileLayers(true);
    this.updateUI();
  }

  /** @return {Layer} Returns the active layer in the project. If no layer is active, null is returned. */
  getActive(): Layer {
    return this.active;
  }

  async combineTileLayers(clear: boolean = false) {
    const isVisible = (layer: Layer): boolean => {
      if (!layer.isVisible()) {
        return false;
      }
      let next = layer;
      while (next != null) {
        if (!next.isVisible()) {
          return false;
        }
        if (next.hasParent()) {
          next = next.getParent();
        } else {
          next = null;
        }
      }
      return true;
    };

    if (clear) {
      const area = new MapArea(CoordinateType.TILE, 0, 0, 1023, 1023);
      this._combinedTileData.clear(area);

      const recurse = (layers: Layer[]): void => {
        for (let index = 0; index < layers.length; index++) {
          const next = layers[index];
          if (next.isCacheDirty()) {
            next.processCache();
          }
          if (isVisible(next)) {
            this._combinedTileData.apply(next.tiles, area);
          }
          if (next.hasChildren()) {
            recurse(next.getChildren());
          }
        }
      };

      recurse(this.layers);
    } else {
      const region = {x1: 1024, y1: 1024, x2: -1, y2: -1};

      const recurseRegion = (layers: Layer[]): void => {
        for (let index = 0; index < layers.length; index++) {
          const next = layers[index];
          const data = next.tiles;
          const dirtyAreas = data.dirtyAreas;
          if (dirtyAreas.length === 0) {
            continue;
          }

          for (let index = 0; index < dirtyAreas.length; index++) {
            const nextArea = dirtyAreas[index];
            if (region.x1 > nextArea.x1) {
              region.x1 = nextArea.x1;
            }
            if (region.x2 < nextArea.x2) {
              region.x2 = nextArea.x2;
            }
            if (region.y1 > nextArea.y1) {
              region.y1 = nextArea.y1;
            }
            if (region.y2 < nextArea.y2) {
              region.y2 = nextArea.y2;
            }
          }
          if (next.hasChildren()) {
            recurseRegion(next.getChildren());
          }
        }
      };

      const recurse = (layers: Layer[], area: MapArea): void => {
        for (let index = 0; index < layers.length; index++) {
          const next = layers[index];
          if (next.isCacheDirty()) {
            next.processCache();
          }
          if (isVisible(next)) {
            this._combinedTileData.apply(next.tiles, area);
          }
          if (next.hasChildren()) {
            recurse(next.getChildren(), area);
          }
        }
      };

      recurseRegion(this.layers);

      if (region.x1 === -1 || region.y1 === -1 || region.x2 === 1024 || region.y2 === 1024) {
        return;
      }
      const area = new MapArea(CoordinateType.TILE, region.x1, region.y1, region.x2, region.y2);
      this._combinedTileData.clear(area);

      recurse(this.layers, area);
    }
  }

  setActive(layer: Layer) {
    const deactivate = (layers: Layer[]): void => {
      for (let index = 0; index < layers.length; index++) {
        const next = layers[index];
        next.ui.setSelected(false);
        if (next.hasChildren()) {
          deactivate(next.getChildren());
        }
      }
    };

    deactivate(this.layers);

    if (this.active != null) {
      this.active.ui.setSelected(false);
    }
    this.active = layer;
    if (layer != null) {
      layer.ui.setSelected(true);
    }
  }
}
