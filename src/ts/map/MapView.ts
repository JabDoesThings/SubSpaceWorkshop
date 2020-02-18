import { MapChunk } from './MapChunk';
import * as PIXI from "pixi.js";

import { LVLMap } from './lvl/LVL';
import { UpdatedObject } from '../util/UpdatedObject';
import { MapSprite } from './MapSprite';
import { MapGrid } from './MapGrid';
import { MapCamera } from './MapCamera';
import { Map } from './old/Map';

const Stats = require("stats.js");

export class MapView extends UpdatedObject {

    readonly map: LVLMap;
    readonly container: HTMLElement;

    private readonly chunks: MapChunk[][];
    private stats: Stats;
    app: PIXI.Application;
    private grid: MapGrid;
    private mapContainer: PIXI.Container;

    mapSpriteFlag: MapSprite;
    mapSpriteGoal: MapSprite;
    mapSpritePrize: MapSprite;
    mapSpriteOver1: MapSprite;
    mapSpriteOver2: MapSprite;
    mapSpriteOver3: MapSprite;
    mapSpriteOver4: MapSprite;
    mapSpriteOver5: MapSprite;
    mapSpriteDoor1: MapSprite;
    mapSpriteDoor2: MapSprite;

    camera: MapCamera;

    public constructor(map: LVLMap, container: HTMLElement) {

        super();

        this.map = map;
        this.container = container;

        this.camera = new MapCamera();

        // Create chunks to view.
        this.chunks = new Array(16);
        for (let x = 0; x < 16; x++) {
            this.chunks[x] = new Array(16);
            for (let y = 0; y < 16; y++) {
                this.chunks[x][y] = new MapChunk(this, x, y);
            }
        }

        this.mapSpriteFlag = new MapSprite(16, 16, 10, 2, 90, 0, 0, 9, 0);
        this.mapSpriteGoal = new MapSprite(16, 16, 9, 2, 90, 0, 1, 8, 1);
        this.mapSpriteOver1 = new MapSprite(16, 16, 15, 2, 80);
        this.mapSpriteOver2 = new MapSprite(32, 32, 10, 3, 80);
        this.mapSpriteOver3 = new MapSprite(16, 16, 15, 2, 80);
        this.mapSpriteOver4 = new MapSprite(96, 96, 5, 2, 80);
        this.mapSpriteOver5 = new MapSprite(80, 80, 4, 6, 80);
        this.mapSpritePrize = new MapSprite(16, 16, 10, 1, 80);

        this.mapSpriteDoor1 = new MapSprite(16, 16, 19, 10, 80, 9, 8, 12, 8);
        this.mapSpriteDoor2 = new MapSprite(16, 16, 19, 10, 80, 13, 8, 16, 8);

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
        this.mapContainer = new PIXI.Container();
        this.app.stage.addChild(this.mapContainer);
        this.app.stage.addChild(this.grid);

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this.app.stage.addChild(this.chunks[x][y].tileMap);
                this.app.stage.addChild(this.chunks[x][y].tileMapAnim);
            }
        }

        this.container.appendChild(this.app.view);

        this.setDirty(true);

        let tick = 0;

        this.app.ticker.add((delta) => {

            this.stats.begin();

            this.mapSpriteFlag.update();
            this.mapSpriteGoal.update();
            this.mapSpritePrize.update();
            this.mapSpriteOver1.update();
            this.mapSpriteOver2.update();
            this.mapSpriteOver3.update();
            this.mapSpriteOver4.update();
            this.mapSpriteOver5.update();
            this.mapSpriteDoor1.update();
            this.mapSpriteDoor2.update();

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
            console.log("RESIZE: width=" + width + ", height=" + height);
            ctx.app.renderer.resize(width, height);
            ctx.setDirty(true);

        }

        // Listen for window resize events
        window.addEventListener('resize', resize);

        resize();
    }

    //@Override
    public onUpdate(delta: number): boolean {

        if (this.camera.isDirty()) {
            this.grid.draw();
        }

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                if (this.chunks[x][y].isDirty()) {
                    this.chunks[x][y].update(delta);
                }
            }
        }

        this.map.setDirty(false);

        return true;
    }

    // @Override
    public isDirty(): boolean {
        return super.isDirty() || this.camera.isDirty() || this.map.isDirty();
    }
}

