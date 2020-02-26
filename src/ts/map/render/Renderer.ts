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

const Stats = require("stats.js");

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

    readonly map: LVLMap;
    readonly lvz: LVZCollection;

    readonly lvlSprites: LVLSpriteCollection;
    readonly lvzSprites: MapSpriteCollection;

    readonly container: HTMLElement;
    private chunks: LVLChunk[][];
    private lvzChunks: LVZChunk[][];
    private stats: Stats;
    app: PIXI.Application;
    private grid: MapGrid;

    private regions: ELVLRegionRender[];

    camera: MapCamera;
    private elvlContainer: PIXI.Container;

    _background: Background;
    _border: LVLBorder;
    _map: PIXI.Container;
    _lvz: PIXI.Container;

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

        this.initPixi();
    }

    private initPixi() {

        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style.top = "calc(100% - 48px)";
        this.stats.dom.style.left = "calc(100% - 80px)";
        this.container.appendChild(this.stats.dom);

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
        this.grid.visible = false;

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
            ctx.app.renderer.resize(width, height);
            ctx.setDirty(true);

        }

        // Listen for window resize events
        window.addEventListener('resize', resize);

        resize();
        // }, 2000);
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

        this.map.setDirty(false);
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

