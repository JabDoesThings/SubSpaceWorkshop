import * as PIXI from "pixi.js";
import { LVLArea, LVLMap } from '../io/LVL';
import { LVL } from '../io/LVLUtils';
import { LVZ } from '../io/LVZUtils';
import { LVLSpriteCollection } from './render/LVLSpriteCollection';
import { MapSprite, MapSpriteCollection } from './render/MapSprite';
import { LVLBorder, LVLChunk } from './render/LVLRender';
import { LVZChunk } from './render/LVZChunk';
import { ELVLRegionRender } from './render/ELVLRegionRender';
import { Background } from '../common/Background';
import { SimpleEditor } from './SimpleEditor';
import { Renderer } from '../common/Renderer';
import { Selection, SelectionGroup, SelectionSlot, SelectionType } from './ui/Selection';
import { UITab } from './ui/UI';
import { CustomEvent, CustomEventListener } from './ui/CustomEventListener';
import { LVZManager } from './LVZManager';

/**
 * The <i>Session</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Session extends CustomEventListener<SessionEvent> {

    selectionGroup: SelectionGroup;
    lvzManager: LVZManager;
    editor: SimpleEditor;
    cache: SessionCache;
    tab: UITab;
    map: LVLMap;
    lvzPaths: string[];
    lvlPath: string;
    _name: string;
    loaded: boolean;

    /**
     * Main constructor.
     *
     * @param lvlPath The path of the map to load.
     * @param lvzPaths The path of the LVZ files to load.
     */
    constructor(lvlPath: string, lvzPaths: string[] = []) {

        super();

        this.lvzManager = new LVZManager();

        this.lvlPath = lvlPath;
        this.lvzPaths = lvzPaths;

        this.selectionGroup = new SelectionGroup();
        this.selectionGroup.setSelection(SelectionSlot.PRIMARY, new Selection(SelectionType.TILE, 1));
        this.selectionGroup.setSelection(SelectionSlot.SECONDARY, new Selection(SelectionType.TILE, 2));

        this.cache = new SessionCache(this);

        let split = lvlPath.split("/");
        this._name = split[split.length - 1].split('.')[0];
    }

    /**
     * Loads map data and LVZ packages in the Session.
     *
     * @param override If true, the session will load. (Even if already loaded)
     *
     * @return Returns true if the action is cancelled.
     */
    load(override: boolean = false): boolean {

        // Make sure that the Session is only loading data when it has to.
        if (!override && this.loaded) {
            return true;
        }

        if (this.loaded) {
            this.unload(true);
        }

        if (this.dispatch({session: this, action: SessionAction.PRE_LOAD, forced: override})) {
            return true;
        }

        this.map = LVL.read(this.lvlPath);

        this.lvzManager.load(this.lvzPaths);
        this.loaded = true;

        this.dispatch({session: this, action: SessionAction.POST_LOAD, forced: true});
    }

    /**
     * Unloads map data and LVZ packages in the Session.
     *
     * @param override If true, the session will unload. (Even if already loaded)
     *
     * @return Returns true if the action is cancelled.
     */
    unload(override: boolean = false): boolean {

        // Make sure that the Session is only unloading data when it has to.
        if (!override && !this.loaded) {
            return true;
        }

        if (this.dispatch({session: this, action: SessionAction.PRE_UNLOAD, forced: override})) {
            return true;
        }

        let tileset = this.map.tileset;
        if (tileset != null && tileset !== LVL.DEFAULT_TILESET) {
            tileset.texture.destroy(true);
            tileset.source = null;
        }

        this.lvzManager.unload();
        this.loaded = false;

        this.dispatch({session: this, action: SessionAction.POST_UNLOAD, forced: true});
        return false;
    }

    onPreUpdate(): void {

        if (this.lvzManager.resourceDirty) {
            this.cache.buildLVZ();
        }

        if (this.lvzManager.dirty) {
            for (let y = 0; y < 16; y++) {
                for (let x = 0; x < 16; x++) {
                    let chunk = this.cache.lvzChunks[x][y];
                    if (this.lvzManager.isDirty(
                        x * 1024,
                        y * 1024,
                        (x + 1) * 1024,
                        (y + 1) * 1024)
                    ) {
                        chunk.build(this, this.editor.renderer.lvzLayers);
                    }
                }
            }
        }

        this.cache.onPreUpdate();
    }

    onUpdate(): void {
    }

    onPostUpdate(): void {
        this.selectionGroup.setDirty(false);
        this.lvzManager.onPostUpdate();
    }
}

/**
 * The <i>SessionCache</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SessionCache {

    readonly session: Session;
    readonly lvlSprites: LVLSpriteCollection;
    readonly lvzSprites: MapSpriteCollection;

    lvzTextures: { [id: string]: PIXI.Texture };

    chunks: LVLChunk[][];
    lvzChunks: LVZChunk[][];
    regions: ELVLRegionRender[];
    _regions: PIXI.Container;
    _map: PIXI.Container;
    _border: LVLBorder;
    _background: Background;
    initialized: boolean;

    callbacks: { [name: string]: ((texture: PIXI.Texture) => void)[] };

    constructor(session: Session) {
        this.session = session;
        this.lvlSprites = new LVLSpriteCollection();
        this.lvzSprites = new MapSpriteCollection();
        this.initialized = false;
        this.regions = [];
        this.callbacks = {};
    }

    init(): void {

        let map = this.session.map;
        let renderer = this.session.editor.renderer;

        let name = this.session._name;
        let seed = 0;
        for (let index = 0; index < name.length; index++) {
            seed += name.charCodeAt(index);
        }

        this._background = new Background(renderer, seed);
        this._background.texLayer.draw();

        this._regions = new PIXI.Container();
        this._regions.alpha = 0.2;

        this._border = new LVLBorder(renderer);

        let screen = renderer.app.renderer.screen;

        this._map = new PIXI.Container();
        this._map.filters = [Renderer.chromaFilter];
        this._map.filterArea = screen;

        // Create chunks to view.
        this.chunks = new Array(16);
        for (let x = 0; x < 16; x++) {
            this.chunks[x] = new Array(16);
            for (let y = 0; y < 16; y++) {
                this.chunks[x][y] = new LVLChunk(renderer, x, y);
            }
        }

        this.lvzChunks = new Array(16);
        for (let x = 0; x < 16; x++) {
            this.lvzChunks[x] = new Array(16);
            for (let y = 0; y < 16; y++) {
                this.lvzChunks[x][y] = new LVZChunk(renderer, x, y);
            }
        }

        let elvl = map.getMetadata();
        let regions = elvl.getRegions();

        this._regions.removeChildren();

        if (regions.length != 0) {
            for (let index = 0; index < regions.length; index++) {
                let next = regions[index];
                this.regions.push(new ELVLRegionRender(renderer, next));
            }

            if (this.regions.length != 0) {
                for (let index = 0; index < this.regions.length; index++) {
                    this._regions.addChild(this.regions[index].container);
                }
            }
        }

        // Create chunks to view.
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this.chunks[x][y].init();
                this._map.addChild(this.chunks[x][y].tileMap);
                this._map.addChild(this.chunks[x][y].tileMapAnim);
            }
        }

        map.setDirty(true, new LVLArea(0, 0, 1023, 1023));
        let tileset = map.tileset;
        if (tileset != null) {
            tileset.setDirty(true);
        }

        this.buildLVZ();

        this.initialized = true;
    }

    buildLVZ(): void {

        if (this.lvzTextures != null) {
            for (let key in this.lvzTextures) {
                let value = this.lvzTextures[key];
                value.destroy(true);
            }
        }

        this.lvzTextures = {};

        let lvzPackages = this.session.lvzManager.packages;

        for (let key in lvzPackages) {

            let nextPkg = lvzPackages[key];

            if (nextPkg.resources == null || nextPkg.resources.length === 0) {
                continue;
            }

            for (let key in nextPkg.resources) {
                let nextResource = nextPkg.resources[key];
                if (nextResource.isImage() && !nextResource.isEmpty()) {
                    LVZ.loadTexture(nextResource, (texture: PIXI.Texture) => {
                        let fileId = nextResource.getName().toLowerCase();
                        this.lvzTextures[fileId] = texture;
                        this.onCallBack(fileId, texture);
                    });
                }
            }
        }

        for (let key in lvzPackages) {

            let nextPkg = lvzPackages[key];

            if (nextPkg.images == null || nextPkg.images.length === 0) {
                continue;
            }

            for (let index = 0; index < nextPkg.images.length; index++) {

                let image = nextPkg.images[index];
                let fileId = image.fileName.toLowerCase();
                let id = nextPkg.name + '>>>' + index;
                let time = image.animationTime / 10;
                let sprite = new MapSprite(0, 0, image.xFrames, image.yFrames, time);
                sprite.id = id;
                sprite.texture = this.lvzTextures[fileId];
                if (sprite.texture != null) {
                    sprite.frameWidth = sprite.texture.width / image.xFrames;
                    sprite.frameHeight = sprite.texture.height / image.yFrames;
                    sprite.reset();
                    sprite.sequenceTexture();
                    sprite.setDirty(true);
                    sprite.id = id;
                }

                let callbacks = this.callbacks[fileId];
                if (callbacks == null) {
                    callbacks = this.callbacks[fileId] = [];
                }

                callbacks.push((texture => {
                    sprite.frameWidth = texture.width / image.xFrames;
                    sprite.frameHeight = texture.height / image.yFrames;
                    sprite.reset();
                    sprite.texture = texture;
                    sprite.sequenceTexture();
                    sprite.setDirty(true);
                    sprite.id = id;
                }));

                this.lvzSprites.addSprite(sprite);
            }
        }

        this.session.lvzManager.dirty = false;
    }

    private onCallBack(name: string, texture: PIXI.Texture): void {

        let callbacks = this.callbacks[name];
        if (callbacks == null || callbacks.length === 0) {
            return;
        }

        for (let index = 0; index < callbacks.length; index++) {
            callbacks[index](texture);
        }
    }

    set(): void {

        let renderer = this.session.editor.renderer;

        // Background Layer
        renderer.layers[1].removeChildren();
        renderer.layers[1].addChild(this._background);

        // Tile Layer
        renderer.layers[2].removeChildren();
        renderer.layers[2].addChild(this.session.editor.renderer.grid);
        renderer.layers[2].addChild(this._map);

        // Weapon Layer

        // Ship Layer

        // Gauges Layer

        // Chat Layer

        // Top-Most Layer

        let radar = renderer.radar;
        radar.draw().then(() => {
            radar.apply();
        });

        renderer.paletteTab.draw();
    }

    onPreUpdate(): void {
        this.lvlSprites.update();
        this.lvzSprites.update();
    }

    destroy(): void {

        if (this._border != null) {
            this._border.texture.destroy();
            this._border = null;
        }

        this.chunks = null;
        this.lvzChunks = null;
        this.regions = null;
        this.initialized = false;
        this._background = null;
    }
}

/**
 * The <i>SessionEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface SessionEvent extends CustomEvent {
    session: Session,
    action: SessionAction
}

/**
 * The <i>SessionAction</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum SessionAction {
    PRE_LOAD = 'pre-load',
    POST_LOAD = 'post-load',
    PRE_SAVE = 'pre-save',
    POST_SAVE = 'post-save',
    PRE_UNLOAD = 'pre-unload',
    POST_UNLOAD = 'post-unload'
}
