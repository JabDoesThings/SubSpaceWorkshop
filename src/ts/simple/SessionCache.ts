import * as PIXI from "pixi.js";
import { LVLBorder, LVLChunk } from './render/LVLRender';
import { LVZChunk } from './render/LVZChunk';
import { ELVLRegionRender } from './render/ELVLRegionRender';
import { Background } from '../common/Background';
import { CustomEvent } from './ui/CustomEventListener';
import { SessionAtlasEvent, TextureAtlasAction, TextureAtlasEvent } from './render/SessionAtlas';
import { Renderer } from '../common/Renderer';
import { LVLArea } from '../io/LVL';
import { Session } from './Session';
import { SelectionRenderer } from './render/SelectionRenderer';

/**
 * The <i>SessionCache</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SessionCache {

    readonly session: Session;
    private readonly forwardListener: (event: CustomEvent) => void;

    chunks: LVLChunk[][];
    lvzChunks: LVZChunk[][];
    regions: ELVLRegionRender[];
    _regions: PIXI.Container;
    _map: PIXI.Container;
    _border: LVLBorder;
    _background: Background;
    initialized: boolean;

    callbacks: { [name: string]: ((texture: PIXI.Texture) => void)[] };

    selectionRenderer: SelectionRenderer;

    /**
     * Main constructor.
     *
     * @param session
     */
    constructor(session: Session) {

        this.session = session;
        this.initialized = false;
        this.regions = [];
        this.callbacks = {};

        this.forwardListener = (event: CustomEvent) => {

            if (this._background != null) {
                if (event.eventType === 'TextureAtlasEvent') {
                    let tEvent = <TextureAtlasEvent> event;
                    let textureAtlas = tEvent.textureAtlas;
                    let id = textureAtlas.id;
                    if (id.startsWith('bg') || id.startsWith('star')) {
                        this._background.setDirty(true);
                    }
                } else if (event.eventType == 'SessionAtlasEvent') {
                    let sEvent = <SessionAtlasEvent> event;
                    let textures = sEvent.textures;
                    for (let key in textures) {
                        if (key.startsWith('bg') || key.startsWith('star')) {
                            this._background.setDirty(true);
                        }
                    }
                }
            }

            if (event.eventType === 'TextureAtlasEvent') {
                let tEvent = <TextureAtlasEvent> event;
                if (tEvent.action == TextureAtlasAction.UPDATE) {
                    this.session.lvzManager.setDirtyArea();
                    this.session.editor.renderer.screen.setDirty(true);
                }
            }
        };

        session.addEventListener(this.forwardListener);
    }

    init(): void {

        this.selectionRenderer = new SelectionRenderer(this.session);

        let map = this.session.map;
        let renderer = this.session.editor.renderer;

        let name = this.session._name;
        let seed = 0;
        for (let index = 0; index < name.length; index++) {
            seed += name.charCodeAt(index);
        }

        this._background = new Background(this.session, renderer, seed);
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

        this.initialized = true;
    }

    set(): void {

        let renderer = this.session.editor.renderer;

        // ### LAYERS ###
        // Background Layer
        renderer.layers.layers[1].removeChildren();
        renderer.layers.layers[1].addChild(this._background);
        // Tile Layer
        renderer.layers.layers[2].removeChildren();
        renderer.layers.layers[2].addChild(this._map);
        // Weapon Layer
        // Ship Layer
        // Gauges Layer
        // Chat Layer
        // Top-Most Layer

        // ##############

        this.session.lvzManager.setDirtyArea();

        let radar = renderer.radar;
        radar.draw().then(() => {
            radar.apply();
        });

        renderer.paletteTab.draw();
    }

    onPreUpdate(): void {

        let atlas = this.session.atlas;
        if (atlas.isDirty()) {
            this.draw();
        }

        this.selectionRenderer.update();
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

    private draw(): void {

        if (this._background != null) {
            this._background.draw();
        }

        if (this.chunks != null) {
            for (let x = 0; x < 16; x++) {
                for (let y = 0; y < 16; y++) {
                    this.chunks[x][y].draw();
                }
            }
        }
    }
}
