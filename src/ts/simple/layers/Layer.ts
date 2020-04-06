import uuid = require('uuid');
import { MapArea } from '../../util/map/MapArea';
import { Dirtable } from '../../util/Dirtable';
import { InheritedObject } from '../../util/InheritedObject';
import { MapRenderer } from '../render/MapRenderer';
import { LayerManager } from './LayerManager';
import { UILayer } from '../ui/LayersPanel';
import { EditLayerVisible } from '../edits/EditLayerVisible';
import { TileData } from '../../util/map/TileData';

export class Layer extends InheritedObject<Layer> implements Dirtable {

    static readonly DEFAULT_NAME: string = 'Untitled Layer';

    readonly manager: LayerManager;
    readonly ui: UILayer;
    private readonly metadata: { [id: string]: any };
    private readonly id: string;

    bounds: MapArea;
    tiles: TileData;
    private name: string;
    private visible: boolean;
    private dirty: boolean;
    private locked: boolean;
    private updatingUI: boolean;

    /**
     * Main constructor.
     *
     * @param manager
     * @param id The unique ID of the layer. <br/>
     *   <b>NOTE</b>: Only provide this when loading an existing layer. A
     *   unique ID will generate for new layers.
     * @param name The displayed name of the layer.
     */
    constructor(manager: LayerManager, id: string, name: string) {

        super();

        // If the ID given is null or undefined, generate a unique one.
        if (id == null) {
            id = uuid.v4();
        }

        // If a name is not provided, use the default name.
        if (name == null) {
            name = Layer.DEFAULT_NAME;
        }

        this.manager = manager;

        this.id = id;
        this.name = name;
        this.visible = true;
        this.tiles = new TileData();

        this.ui = new UILayer(this.name);
        this.ui.visibilityElement.addEventListener('click', (event) => {

            let edit = new EditLayerVisible(this, !this.visible);
            let editManager = this.manager.project.editManager;
            editManager.append([edit]);
            editManager.push();
        });

        this.ui.element.addEventListener('click', (event) => {
            this.manager.setActive(this);
        });

        this.updatingUI = false;
    }

    // @Override
    addChild(object: Layer): void {
        super.addChild(object);
        this.updateUI();
    }

    // @Override
    removeChild(object: Layer): number {
        let index = super.removeChild(object);
        this.updateUI();
        return index;
    }

    // @Override
    removeChildren(): Layer[] {
        let copy = super.removeChildren();
        this.updateUI();
        return copy;
    }

    private updateUI(): void {

        if (this.updatingUI) {
            return;
        }

        this.updatingUI = true;

        this.ui.removeChildren();

        let children = this.getChildren();
        for (let index = children.length - 1; index >= 0; index--) {
            this.ui.addChild(children[index].ui);
        }

        this.manager.updateUI();

        this.updatingUI = false;
    }

    preUpdate(): void {

        this.onPreUpdate();

        if (this.hasChildren()) {
            let children = this.getChildren();
            for (let index = 0; index < children.length; index++) {
                children[index].preUpdate();
            }
        }
    }

    update(delta: number): void {

        this.onUpdate(delta);

        if (this.hasChildren()) {
            let children = this.getChildren();
            for (let index = 0; index < children.length; index++) {
                children[index].update(delta);
            }
        }
    }

    postUpdate(): void {

        this.onPostUpdate();

        if (this.hasChildren()) {
            let children = this.getChildren();
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
     * @param x The 'X' coordinate of the tile.
     * @param y The 'Y' coordinate of the tile.
     *
     * @return Returns the ID on the layer (child-layer if applicable). If no tile data
     *   are available, -1 is returned.
     */
    getTile(x: number, y: number): number {

        // Check the children first as they are on-top.
        if (this.hasChildren()) {
            let children = this.getChildren();
            for (let index = children.length - 1; index >= 0; index--) {
                let tileId = children[index].getTile(x, y);
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
     * @return Returns the displayed name of the layer.
     */
    getName(): string {
        return this.name;
    }

    /**
     * Sets the displayed name of the layer.
     *
     * @param name The name to set.
     */
    setName(name: string): void {
        this.name = name;
    }

    /**
     * @return Returns the unique ID of the layer.
     */
    getId(): string {
        return this.id;
    }

    /**
     * @return Returns true if the layer is locked.
     */
    isLocked(): boolean {
        return this.locked;
    }

    /**
     * Sets whether or not the layer is locked.
     *
     * @param flag The flag to set.
     */
    setLocked(flag: boolean): void {
        this.locked = flag;
    }

    isVisible(): boolean {
        return this.visible;
    }

    setVisible(flag: boolean): void {

        if (this.visible === flag) {
            return;
        }

        this.visible = flag;
        this.ui.setVisible(flag);
        this.manager.updateUI();

        this.setDirty(true);

        if (flag) {
            this.manager.combineTileLayers(true);
        }
    }

    // @Override
    isDirty(): boolean {
        return this.dirty || (this.tiles != null && this.tiles.isDirty());
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    activate(renderer: MapRenderer): void {

        this.onActivate(renderer);

        if (this.hasChildren()) {
            let children = this.getChildren();
            for (let index = 0; index < children.length; index++) {
                children[index].activate(renderer);
            }
        }
    }

    /**
     * @return Returns the minimum and maximum coordinates populated by the layer.
     */
    getBounds(): MapArea {
        return;
    }

    getMetadata(id: string): any {
        return this.metadata[id];
    }

    setMetadata(id: string, value: any): void {
        this.metadata[id] = value;
    }

    getMetadataTable(): { [id: string]: any } {
        return this.metadata;
    }

    protected onPreUpdate(): void {
    }

    protected onUpdate(delta: number): void {
    }

    protected onPostUpdate(): void {
    }

    onActivate(renderer: MapRenderer): void {
    }
}
