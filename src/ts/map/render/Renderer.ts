import { LVLBorder, LVLChunk } from './LVLRender';
import * as PIXI from "pixi.js";

import { LVLMap } from '../lvl/LVL';
import { UpdatedObject } from '../../util/UpdatedObject';
import { MapSpriteCollection } from './MapSprite';
import { MapGrid } from './MapGrid';
import { MapCamera } from './MapCamera';
import Filter = PIXI.Filter;
import { LVZCollection, LVZMapObject } from '../lvz/LVZ';
import { LVLSpriteCollection } from './LVLSpriteCollection';
import { LVZChunk } from './LVZChunk';
import { ELVLRegionRender } from './ELVLRegionRender';
import { Background } from './Background';
import InteractionEvent = PIXI.interaction.InteractionEvent;
import { Radar } from './Radar';
import { TilesetWindow } from './TilesetWindow';

const Stats = require("stats.js");

export interface MapMouseEvent {
    type: MapMouseEventType,
    data: MapSpace,
    button: number
}

export interface MapSpace {
    tileX: number,
    tileY: number,
    x: number,
    y: number
}

export enum MapMouseEventType {
    DOWN = 'down',
    UP = 'up',
    DRAG = 'drag',
    HOVER = 'hover',
    ENTER = 'enter',
    EXIT = 'exit'
}

export class Renderer extends UpdatedObject {

    static fragmentSrc = [
        "varying vec2 vTextureCoord;" +
        "uniform sampler2D uSampler;" +
        "void main(void) {" +
        "   gl_FragColor = texture2D(uSampler, vTextureCoord);" +
        "   if(gl_FragColor.r == 0.0 && gl_FragColor.g == 0.0 && gl_FragColor.b == 0.0) {" +
        "       gl_FragColor.a = 0.0;" +
        "   }" +
        "}"
    ].join("\n");

    static chromaFilter = new Filter(undefined, Renderer.fragmentSrc, undefined);

    readonly mouseListeners: ((event: MapMouseEvent) => void)[] = [];

    readonly lvlSprites: LVLSpriteCollection;
    readonly lvzSprites: MapSpriteCollection;
    readonly container: HTMLElement;

    private chunks: LVLChunk[][];
    private lvzChunks: LVZChunk[][];
    private stats: Stats;
    private regions: ELVLRegionRender[];
    private elvlContainer: PIXI.Container;

    readonly map: LVLMap;
    readonly lvz: LVZCollection;
    readonly radar: Radar;

    app: PIXI.Application;
    camera: MapCamera;
    grid: MapGrid;
    _background: Background;
    _border: LVLBorder;
    _map: PIXI.Container;
    _lvz: PIXI.Container;

    tilesetWindow: TilesetWindow;

    public constructor(container: HTMLElement, map: LVLMap, lvz: LVZCollection = new LVZCollection()) {

        super();

        this.container = container;
        this.map = map;
        this.lvz = lvz;

        this.lvlSprites = new LVLSpriteCollection(this.map);
        this.lvzSprites = new MapSpriteCollection();

        this.regions = [];

        let elvl = map.getMetadata();
        let regions = elvl.getRegions();

        if (regions.length != 0) {
            for (let index = 0; index < regions.length; index++) {

                let next = regions[index];

                let renderer = new ELVLRegionRender(this, next);
                this.regions.push(renderer);
            }
        }

        this.camera = new MapCamera();

        this.radar = new Radar(this);

        this.initPixi();
    }

    private initPixi() {

        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style.left = "0px";
        this.stats.dom.style.bottom = "0px";

        // Use the native window resolution as the default resolution will support high-density
        //   displays when rendering
        PIXI.settings.RESOLUTION = window.devicePixelRatio;
        // Disable interpolation when scaling, will make texture be pixelated
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        PIXI.settings.RENDER_OPTIONS.antialias = false;
        PIXI.settings.RENDER_OPTIONS.forceFXAA = false;
        PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF;
        PIXI.settings.SPRITE_MAX_TEXTURES = 1024;

        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
            antialias: false,
            forceFXAA: false,
            clearBeforeRender: true
        });

        this.grid = new MapGrid(this);
        this.grid.filters = [];
        this.grid.filterArea = this.app.renderer.screen;

        this.elvlContainer = new PIXI.Container();
        this.elvlContainer.alpha = 0.2;

        this._border = new LVLBorder(this);

        this._map = new PIXI.Container();
        this._map.filters = [Renderer.chromaFilter];
        this._map.filterArea = this.app.renderer.screen;

        this._lvz = new PIXI.Container();
        this._lvz.filters = [Renderer.chromaFilter];
        this._lvz.filterArea = this.app.renderer.screen;

        this._background = new Background(this);

        this.tilesetWindow = new TilesetWindow(this);

        let stage = this.app.stage;

        stage.addChild(this._background);
        stage.addChild(this.elvlContainer);
        stage.addChild(this.grid);
        stage.addChild(this._border);
        stage.addChild(this._map);
        stage.addChild(this._lvz);

        this.buildLVZSpriteCollection();

        // Create chunks to view.
        this.chunks = new Array(16);
        for (let x = 0; x < 16; x++) {
            this.chunks[x] = new Array(16);
            for (let y = 0; y < 16; y++) {
                this.chunks[x][y] = new LVLChunk(this, x, y);
            }
        }

        this.lvzChunks = new Array(16);
        for (let x = 0; x < 16; x++) {
            this.lvzChunks[x] = new Array(16);
            for (let y = 0; y < 16; y++) {
                this.lvzChunks[x][y] = new LVZChunk(this, x, y);
            }
        }

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this._map.addChild(this.chunks[x][y].tileMap);
                this._map.addChild(this.chunks[x][y].tileMapAnim);
            }
        }

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this._lvz.addChild(this.lvzChunks[x][y].container);
            }
        }

        if (this.regions.length != 0) {
            for (let index = 0; index < this.regions.length; index++) {
                this.elvlContainer.addChild(this.regions[index].container);
            }
        }

        this.app.view.id = 'viewport';
        this.container.appendChild(this.app.view);

        this.setDirty(true);

        let tick = 0;

        this.app.ticker.add((delta) => {

            this.stats.begin();

            let sw = this.app.view.width;
            let sh = this.app.view.height;

            let cPos = this.camera.getPosition();
            let cx = cPos.x * 16;
            let cy = cPos.y * 16;

            this.camera.bounds.x = cx - sw / 2.0;
            this.camera.bounds.y = cy - sh / 2.0;
            this.camera.bounds.width = sw;
            this.camera.bounds.height = sh;

            this.lvlSprites.update();
            this.lvzSprites.update();

            this.camera.update(delta);
            this.update(delta);

            this.stats.end();
        });

        let ctx = this;

        let tileAnimationTick = 0;
        let tileAnim = 0;

        // Resize function window
        function resize() {

            // @ts-ignore
            ctx.app.renderer.plugins.tilemap.tileAnim[0] = tileAnim * 16;
            if (tick > tileAnimationTick) {
                tileAnimationTick = tick + 300;

                tileAnim = tileAnim + 1;
                if (tileAnim >= 10) {
                    tileAnim = 0;
                }
            }

            let parent = ctx.container;
            // Resize the renderer
            let width = parent.clientWidth;
            let height = parent.clientHeight;
            ctx.app.renderer.resize(width - 2, height - 2);
            ctx.setDirty(true);

            let $leftTabMenu = $('#editor-left-tab-menu');
            $leftTabMenu.css({top: window.innerHeight + 'px'});

        }

        // Listen for window resize events
        window.addEventListener('resize', resize);

        resize();

        this.app.stage.interactive = true;

        let toMapSpace = (e: InteractionEvent): MapSpace => {
            let cPos = this.camera.getPosition();
            let cx = cPos.x * 16.0;
            let cy = cPos.y * 16.0;
            let sw = this.app.screen.width;
            let sh = this.app.screen.height;
            let gMouse = e.data.global;
            let mx = Math.floor(cx + (gMouse.x - (sw / 2.0)));
            let my = Math.floor(cy + (gMouse.y - (sh / 2.0)));
            let tx = Math.floor(mx / 16.0);
            let ty = Math.floor(my / 16.0);
            return {x: mx, y: my, tileX: tx, tileY: ty};
        };

        let dispatch = (event: MapMouseEvent): void => {

            if (this.mouseListeners.length != 0) {
                for (let index = 0; index < this.mouseListeners.length; index++) {
                    this.mouseListeners[index](event);
                }
            }
        };

        let down = false;

        let onButtonDown = (e: InteractionEvent) => {
            down = true;
            dispatch({data: toMapSpace(e), type: MapMouseEventType.DOWN, button: e.data.button});
        };

        let onButtonMove = (e: InteractionEvent) => {
            dispatch({
                data: toMapSpace(e),
                type: down ? MapMouseEventType.DRAG : MapMouseEventType.HOVER,
                button: e.data.button
            });
        };

        let onButtonUp = (e: InteractionEvent) => {
            down = false;
            dispatch({data: toMapSpace(e), type: MapMouseEventType.UP, button: e.data.button});
        };
        let onButtonOver = (e: InteractionEvent) => {
            let mapSpace = toMapSpace(e);
            dispatch({data: toMapSpace(e), type: MapMouseEventType.ENTER, button: e.data.button});
        };
        let onButtonOut = (e: InteractionEvent) => {
            let mapSpace = toMapSpace(e);
            dispatch({data: toMapSpace(e), type: MapMouseEventType.EXIT, button: e.data.button});
        };
        this.app.stage.on('pointerdown', onButtonDown)
            .on('pointerup', onButtonUp)
            .on('pointerupoutside', onButtonUp)
            .on('pointerover', onButtonOver)
            .on('pointerout', onButtonOut)
            .on('pointermove', onButtonMove);

        let drawn = false;

        let downPrimary = false;
        let downSecondary = false;

        this.mouseListeners.push((event: MapMouseEvent): void => {

            let button = event.button;

            if (event.type === MapMouseEventType.DRAG) {
                button = downPrimary ? 0 : downSecondary ? 2 : 99;
            }

            if (event.type === MapMouseEventType.UP) {

                if (button == 0) {
                    downPrimary = false;
                } else if (button == 2) {
                    downSecondary = false;
                }

                if (drawn) {
                    this.radar.draw().then(() => {
                        this.radar.apply();
                    });
                }
                drawn = false;
            }

            if (event.type !== MapMouseEventType.DOWN && event.type !== MapMouseEventType.DRAG) {
                return;
            }

            if (event.type === MapMouseEventType.DOWN) {
                if (button == 0) {
                    downPrimary = true;
                } else if (button == 2) {
                    downSecondary = true;
                }
            }

            let data = event.data;
            let x = data.tileX;
            let y = data.tileY;
            if ((downPrimary || downSecondary) && x >= 0 && x < 1024 && y >= 0 && y < 1024) {

                console.log(event.button);

                let tileId = downPrimary ? this.tilesetWindow.primary : this.tilesetWindow.secondary;

                this.map.setTile(x, y, tileId);
                drawn = true;
            }
        });

        this.radar.draw().then(() => {
            this.radar.apply();
        });

        this.tilesetWindow.draw();

        this.app.view.appendChild(this.stats.dom);

    }

    //@Override
    public onUpdate(delta: number): boolean {

        if (this.camera.isDirty()) {
            this.grid.draw();
            this._background.update();
            this._border.update();
        }

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this.chunks[x][y].onUpdate(delta);
                this.lvzChunks[x][y].onUpdate();
            }
        }

        if (this.regions.length != 0) {
            for (let index = 0; index < this.regions.length; index++) {
                this.regions[index].update();
            }
        }

        this.radar.update();

        this.map.setDirty(false);
        this.map.tileset.setDirty(false);
        this.lvz.setDirty(false);

        return true;
    }

    // @Override
    public isDirty(): boolean {
        return super.isDirty() || this.camera.isDirty() || this.map.isDirty();
    }

    private buildLVZSpriteCollection() {

        this.lvzSprites.clear();
        let mapObjects: LVZMapObject[] = this.lvz.getMapObjects();
        for (let index = 0; index < mapObjects.length; index++) {

            let next = mapObjects[index];
            let sprite = next.image.getSprite();

            if (this.lvzSprites.getIndex(sprite) == -1) {
                this.lvzSprites.addSprite(sprite);
            }
        }
    }
}

