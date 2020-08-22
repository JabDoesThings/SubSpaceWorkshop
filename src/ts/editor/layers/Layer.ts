import uuid = require('uuid');
import MapArea from '../../util/map/MapArea';
import Dirtable from '../../util/Dirtable';
import InheritedObject from '../../util/InheritedObject';
import MapRenderer from '../render/MapRenderer';
import TileData from '../../util/map/TileData';
import CoordinateType from '../../util/map/CoordinateType';
import { Zip } from '../../io/Zip';
import LayerManager from './LayerManager';
import { UILayer } from '../../ui/UI';
import EditLayerVisible from '../edits/EditLayerVisible';

/**
 * The <i>Layer</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class Layer extends InheritedObject<Layer> implements Dirtable {
  static readonly DEFAULT_NAME: string = 'Untitled Layer';
  readonly ui: UILayer;
  bounds: MapArea;
  tiles: TileData;
  _tileCache: TileData;
  protected manager: LayerManager;
  private readonly metadata: { [id: string]: any };
  private readonly id: string;
  private readonly type: string;
  private name: string;
  private visible: boolean = true;
  private locked: boolean = false;
  private updatingUI: boolean = false;
  private cacheDirty: boolean = true;
  private dirty: boolean = true;

  /**
   * @param {string} type The type of Layer.
   * @param {string} id The unique ID of the layer. <br/>
   *   <b>NOTE</b>: Only provide this when loading an existing layer. A
   *   unique ID will generate for new layers.
   * @param {string} name The displayed name of the layer.
   */
  constructor(type: string, id: string, name: string) {
    super();
    // If the ID given is null or undefined, generate a unique one.
    if (id == null) {
      id = uuid.v4();
    }
    if (type == null) {
      type = 'default';
    }
    this.type = type;
    // If a name is not provided, use the default name.
    if (name == null) {
      name = Layer.DEFAULT_NAME;
    }
    this.id = id;
    this.name = name;
    this.tiles = new TileData();
    this._tileCache = new TileData();
    this.ui = new UILayer(this.name);
    this.ui.visibilityElement.addEventListener('click', () => {
      const edit = new EditLayerVisible(this, !this.visible);
      const editManager = this.manager.project.editManager;
      editManager.append([edit]);
      editManager.push();
    });

    this.ui.element.addEventListener('click', () => {
      this.manager.setActive(this);
    });
  }

  load(json: { [field: string]: any }, projectZip: Zip): void {
    if (json.name == null) {
      throw new Error(`The layer '${this.id}' does not have a name.`);
    }
    if (json.visible == null) {
      throw new Error(`The layer '${this.id}' does not have the 'visible' flag.`);
    }
    // Load metadata for the layer.
    if (json.metadata != null) {
      for (let o in json.metadata) {
        const key: string = <string> o;
        const value = json.metadata[key];
        this.setMetadata(key, value);
      }
    }
    this.name = json.name;
    this.visible = json.visible;
    // If the map has tile-data, load it.
    if (json.tiledata != null) {
      const tileData: Buffer = <Buffer> projectZip.get(json.tiledata);
      if (tileData != null) {
        try {
          this.tiles = TileData.fromBuffer(tileData);
        } catch (e) {
          console.error(`Failed to read '${json.tiledata}'.`);
          console.error(e);
        }
      }
    }
    try {
      this.onLoad(json, projectZip);
    } catch (e) {
      console.error(`Failed to onLoad() layer. (id: ${this.id}, name: ${this.name})`);
      throw e;
    }
    this.setDirty(true);
  }

  save(projectZip: Zip): { [field: string]: any } {
    const json: { [field: string]: any } = {};
    json.name = this.getName();
    json.visible = this.isVisible();
    json.locked = this.isLocked();
    json.metadata = this.getMetadataTable();

    if (this.type === 'default') {
      let tileCount = this.tiles.getTileCount();
      if (tileCount !== 0) {
        const id = `${this.getId()}.tiledata`;
        json.tiledata = id;
        try {
          projectZip.set(id, TileData.toBuffer(this.tiles));
        } catch (e) {
          console.error(`Failed to compile TILEDATA: ${id}`);
          console.error(e);
        }
      }
    }

    try {
      this.onSave(json, projectZip);
    } catch (e) {
      console.error(`Failed to onSave() layer. (id: ${this.id}, name: ${this.name})`);
      throw e;
    }
    return json;
  }

  merge(other: Layer): void {
    this.tiles.apply(other.tiles);
    this.getChildren().forEach(child => {
      this.addChild(child);
    });
    this.setDirty(true);
    this.setCacheDirty(true);
  }

  setManager(manager: LayerManager): void {
    this.manager = manager;
    if (this.hasChildren()) {
      const children = this.getChildren();
      for (let index = 0; index < children.length; index++) {
        children[index].setManager(manager);
      }
    }
  }

  /** @override */
  addChild(object: Layer): void {
    object.setManager(this.manager);
    super.addChild(object);
    this.updateUI();
  }

  /** @override */
  removeChild(object: Layer): number {
    object.setManager(undefined);
    const index = super.removeChild(object);
    this.updateUI();
    return index;
  }

  /** @override */
  removeChildren(): Layer[] {
    const copy = super.removeChildren();
    this.updateUI();
    return copy;
  }

  private updateUI(): void {
    if (this.updatingUI) {
      return;
    }
    this.updatingUI = true;
    this.ui.removeChildren();
    const children = this.getChildren();
    for (let index = children.length - 1; index >= 0; index--) {
      this.ui.addChild(children[index].ui);
    }
    this.ui.setSelected(this === this.manager.active);
    this.ui.setVisible(this.visible);
    this.ui.setLocked(this.locked);
    this.manager.updateUI();
    this.updatingUI = false;
  }

  preUpdate(): void {
    if (this.isDirty() || this.isChildrenDirty()) {
      this.cacheDirty = true;
    }
    this.onPreUpdate();
    if (this.hasChildren()) {
      const children = this.getChildren();
      for (let index = 0; index < children.length; index++) {
        children[index].preUpdate();
      }
    }
  }

  update(delta: number): void {
    this.onUpdate(delta);
    if (this.hasChildren()) {
      const children = this.getChildren();
      for (let index = 0; index < children.length; index++) {
        children[index].update(delta);
      }
    }
  }

  processCache(): void {
    this._tileCache.clear(
      new MapArea(
        CoordinateType.TILE,
        0,
        0,
        this._tileCache.width - 1,
        this._tileCache.height - 1
      )
    );

    this.onCacheApply();
    if (this.hasChildren()) {
      const children = this.getChildren();
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        if (child.isCacheDirty()) {
          child.processCache();
        }
        this._tileCache.apply(child._tileCache);
      }
    }
    this.cacheDirty = false;
  }

  protected onCacheApply(): void {
    this._tileCache.apply(this.tiles);
  }

  postUpdate(): void {
    this.onPostUpdate();
    if (this.hasChildren()) {
      const children = this.getChildren();
      for (let index = 0; index < children.length; index++) {
        children[index].postUpdate();
      }
    }
    if (this.tiles != null) {
      this.tiles.setDirty(false);
    }
    this.setDirty(false);
  }

  /**
   * @param {number} x The 'X' coordinate of the tile.
   * @param {number} y The 'Y' coordinate of the tile.
   *
   * @return {number} Returns the ID on the layer (child-layer if applicable). If no tile data
   *   are available, -1 is returned.
   */
  getTile(x: number, y: number): number {
    // Check the children first as they are on-top.
    if (this.hasChildren()) {
      const children = this.getChildren();
      for (let index = children.length - 1; index >= 0; index--) {
        const tileId = children[index].getTile(x, y);
        if (tileId > 0) {
          return tileId;
        }
      }
    }
    // Check if the layer is a TileLayer and check here.
    if (this.tiles != null && x < this.tiles.width && y < this.tiles.height) {
      return this.tiles.get(x, y);
    }
    // If the tile is out of the boundaries of the tile data, return -1.
    return -1;
  }

  /**
   * @return {string} Returns the displayed name of the layer.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Sets the displayed name of the layer.
   *
   * @param {string} name The name to set.
   */
  setName(name: string): void {
    this.name = name;
    this.updateUI();
  }

  /** @return {string} Returns the unique ID of the layer. */
  getId(): string {
    return this.id;
  }

  /** @return Returns true if the layer is locked. */
  isLocked(): boolean {
    return this.locked;
  }

  /**
   * Sets whether or not the layer is locked.
   *
   * @param {boolean} flag The flag to set.
   */
  setLocked(flag: boolean): void {
    if (flag === this.locked) {
      return;
    }
    this.locked = flag;
    this.updateUI();
  }

  /** @return {boolean} */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   *
   * @param {boolean} flag
   */
  setVisible(flag: boolean): void {
    if (this.visible === flag) {
      return;
    }
    this.visible = flag;
    this.ui.setVisible(flag);
    this.updateUI();
    this.setDirty(true);
    this.manager.combineTileLayers(true);
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty || (this.tiles != null && this.tiles.isDirty());
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  /** @return {boolean} */
  isCacheDirty(): boolean {
    return this.cacheDirty;
  }

  /**
   * @param {boolean} flag
   */
  setCacheDirty(flag: boolean): void {
    this.cacheDirty = flag;
  }

  /**
   * @param {MapRenderer} renderer
   */
  activate(renderer: MapRenderer): void {
    this.onActivate(renderer);
    this.updateUI();
    if (this.hasChildren()) {
      const children = this.getChildren();
      for (let index = 0; index < children.length; index++) {
        children[index].activate(renderer);
      }
    }
  }

  /** @return {MapArea} Returns the minimum and maximum coordinates populated by the layer. */
  getBounds(): MapArea {
    return this._tileCache.getBounds();
  }

  /**
   * @param {string} id
   * @return {any}
   */
  getMetadata(id: string): any {
    return this.metadata[id];
  }

  /**
   * @param {string} id
   * @param {any} value
   */
  setMetadata(id: string, value: any): void {
    this.metadata[id] = value;
  }

  /** @return {[id: string]: any} */
  getMetadataTable(): { [id: string]: any } {
    return this.metadata;
  }

  protected onPreUpdate(): void {
  }

  protected onUpdate(delta: number): void {
  }

  protected onPostUpdate(): void {
  }

  /**
   * @param {MapRenderer} renderer
   */
  onActivate(renderer: MapRenderer): void {
  }

  /** @return {boolean} */
  isChildrenDirty(): boolean {
    if (!this.hasChildren()) {
      return false;
    }
    const children = this.getChildren();
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (child.isDirty() || child.isChildrenDirty()) {
        return true;
      }
    }
    return false;
  }

  onLoad(json: { [field: string]: any }, projectZip: Zip): void {
  }

  onSave(json: { [field: string]: any }, projectZip: Zip): void {
  }
}
