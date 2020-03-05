import { LVLArea, LVLMap } from '../io/LVL';
import { LVL } from '../io/LVLUtils';
import { LVZCollection, LVZMapObject, LVZPackage } from '../io/LVZ';
import { LVZ } from '../io/LVZUtils';
import { LVLSpriteCollection } from './render/LVLSpriteCollection';
import { MapSpriteCollection } from './render/MapSprite';
import { LVLBorder, LVLChunk } from './render/LVLRender';
import { LVZChunk } from './render/LVZChunk';
import { ELVLRegionRender } from './render/ELVLRegionRender';
import { Background } from '../common/Background';
import { SimpleEditor } from './SimpleEditor';
import * as PIXI from "pixi.js";
import { Renderer } from '../common/Renderer';

export class Session {

    private lvlPath: string;
    private lvzPaths: string[];

    map: LVLMap;
    lvzPackages: LVZPackage[];
    tab: HTMLDivElement;
    _name: string;
    loaded: boolean;

    editor: SimpleEditor;
    cache: SessionCache;

    constructor(lvlPath: string, lvzPaths: string[] = []) {

        this.lvlPath = lvlPath;
        this.lvzPaths = lvzPaths;

        this.cache = new SessionCache(this);

        let split = lvlPath.split("/");
        this._name = split[split.length - 1].split('.')[0];

        // Create the tab to add to the map list.
        this.tab = document.createElement('div');
        this.tab.classList.add('tab');
        this.tab.innerHTML = '<label>' + this._name + '</label>';
    }

    load(override: boolean = false): void {

        if (override || !this.loaded) {

            this.map = LVL.read(this.lvlPath);

            this.lvzPackages = [];
            for (let index = 0; index < this.lvzPaths.length; index++) {
                let next = LVZ.read(this.lvzPaths[index]).inflate();
                this.lvzPackages.push(next);

                this.cache.lvz.addAll(next.collect());
            }

            this.loaded = true;
        }
    }

}

export class SessionCache {

    readonly session: Session;
    readonly lvlSprites: LVLSpriteCollection;
    readonly lvzSprites: MapSpriteCollection;

    chunks: LVLChunk[][];
    lvzChunks: LVZChunk[][];
    regions: ELVLRegionRender[];

    _regions: PIXI.Container;
    _map: PIXI.Container;
    _lvz: PIXI.Container;
    _border: LVLBorder;
    _background: Background;

    initialized: boolean;

    lvz: LVZCollection;

    constructor(session: Session) {
        this.session = session;
        this.lvlSprites = new LVLSpriteCollection();
        this.lvzSprites = new MapSpriteCollection();
        this.initialized = false;
        this.regions = [];
        this.lvz = new LVZCollection();
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

        this._lvz = new PIXI.Container();
        this._lvz.filters = [Renderer.chromaFilter];
        this._lvz.filterArea = screen;

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

        this.lvz.setDirty(true);

        let mapObjects: LVZMapObject[] = this.lvz.getMapObjects();
        for (let index = 0; index < mapObjects.length; index++) {

            let next = mapObjects[index];
            let sprite = next.image.getSprite();

            if (this.lvzSprites.getIndex(sprite) == -1) {
                this.lvzSprites.addSprite(sprite);
            }
        }

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this._lvz.addChild(this.lvzChunks[x][y].container);
            }
        }

        this.initialized = true;
    }

    set(stage: PIXI.Container) {

        stage.removeChildren();

        stage.addChild(this._background);
        stage.addChild(this._regions);
        stage.addChild(this._border);
        stage.addChild(this.session.editor.renderer.grid);
        stage.addChild(this._map);
        stage.addChild(this._lvz);

        let renderer = this.session.editor.renderer;
        let radar = renderer.radar;
        radar.draw().then(() => {
            radar.apply();
        });

        let tilesetWindow = renderer.tilesetWindow;
        tilesetWindow.draw();
    }

    destroy(): void {

        if (this.lvz != null) {

            let mapObjects = this.lvz.getMapObjects();
            for (let index = 0; index < mapObjects.length; index++) {
                mapObjects[index].getImage().destroy();
            }

            let screenObject = this.lvz.getScreenObjects();
            for (let index = 0; index < screenObject.length; index++) {
                screenObject[index].getImage().destroy();
            }

            this.lvz = null;
        }

        if (this._lvz != null) {
            this._lvz.removeChildren();
            this._lvz = null;
        }

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
