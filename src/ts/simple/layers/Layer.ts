import uuid = require('uuid');
import { MapArea } from '../../util/map/MapArea';
import { Dirtable } from '../../util/Dirtable';
import { InheritedObject } from '../../util/InheritedObject';
import { TileLayer } from './TileLayer';
import { MapRenderer } from '../render/MapRenderer';
import { LayerManager } from './LayerManager';
import { UILayer } from '../ui/LayersPanel';

export abstract class Layer extends InheritedObject<Layer> implements Dirtable {

    static readonly DEFAULT_NAME: string = 'Untitled Layer';

    private readonly id: string;
    private name: string;
    private visible: boolean;
    private dirty: boolean;
    private locked: boolean;

    readonly renderLayers: PIXI.Container[];
    readonly manager: LayerManager;

    readonly ui: UILayer;

    /**
     * Main constructor.
     *
     * @param id The unique ID of the layer. <br/>
     *   <b>NOTE</b>: Only provide this when loading an existing layer. A
     *   unique ID will generate for new layers.
     * @param name The displayed name of the layer.
     */
    protected constructor(manager: LayerManager, id: string, name: string) {

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

        this.renderLayers = [];
        for (let index = 0; index < 8; index++) {
            let next = new PIXI.Container();
            next.sortableChildren = false;
            next.interactive = next.interactiveChildren = false;
            this.renderLayers.push(next);
        }

        this.ui = new UILayer(this.name);
        this.ui.visibilityElement.addEventListener('click', (event) => {
            this.setVisible(!this.visible);
            this.ui.setVisible(this.visible);
            this.manager.combineTileLayers(true);
        });

        this.ui.element.addEventListener('click', (event) => {
            this.manager.setActive(this);
            // this.ui.setSelected(true);
        });
    }

    private updatingUI: boolean = false;

    // @Override
    addChild(object: Layer): void {
        super.addChild(object);
        this.updateUI();
    }

    // @Override
    removeChild(object: Layer): void {
        super.removeChild(object);
        this.updateUI();
    }

    // @Override
    removeChildren(): void {
        super.removeChildren();
        this.updateUI();
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

        let visible = this.hasParent() ? this.getParent().isVisible() && this.visible : this.visible;

        // Set all rendered layers to the visibility state.
        for (let index = 0; index < this.renderLayers.length; index++) {
            this.renderLayers[index].visible = visible;
        }

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
        if ((this instanceof TileLayer)) {
            return (<TileLayer> this).tiles.get(x, y);
        }

        // If there are no children who are TileLayers AND this layer is NOT a
        //   TileLayer, then return -1 to let the caller know that there's no
        //   tile data at all for this coordinate.
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

        if (this instanceof TileLayer) {
            this.manager.combineTileLayers();
        }

        this.setDirty(true);
    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
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

    protected abstract onPreUpdate(): void;

    protected abstract onUpdate(delta: number): void;

    protected abstract onPostUpdate(): void;

    /**
     * @return Returns the minimum and maximum coordinates populated by the layer.
     */
    abstract getBounds(): MapArea;

    abstract onActivate(renderer: MapRenderer): void;
}

