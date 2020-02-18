import { LVLMap } from './lvl/LVL';
import * as PIXI from "pixi.js";
import { TileUtils } from './old/TileUtils';
import { Vector2 } from 'three';
import { KeyListener } from '../util/KeyListener';
import { MapUtils } from './old/MapUtils';
import { Dirtable } from '../util/Dirtable';
import { RasterMapObject } from './objects/RasterMapObject';
import { LVL } from './lvl/LVLUtils';

const Stats = require("stats.js");

export class LVLMapView implements Dirtable {

    readonly map: LVLMap;
    readonly container: HTMLElement;

    private readonly chunks: LVLMapChunk[][];
    private stats: Stats;
    app: PIXI.Application;
    private grid: LVLGridRenderer;
    private mapContainer: PIXI.Container;

    private dirty: boolean;
    camera: LVLCamera;

    public constructor(map: LVLMap, container: HTMLElement) {

        this.map = map;
        this.container = container;

        this.camera = new LVLCamera();

        // Create chunks to view.
        this.chunks = new Array(16);
        for (let x = 0; x < 16; x++) {
            this.chunks[x] = new Array(16);
            for (let y = 0; y < 16; y++) {
                this.chunks[x][y] = new LVLMapChunk(this, x, y);
            }
        }

        this.initPixi();
    }

    private initPixi() {

        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style.top = "calc(100% - 48px)";
        this.stats.dom.style.left = "calc(100% - 80px)";
        this.container.appendChild(this.stats.dom);

        // Use the native window resolution as the default resolution
        // will support high-density displays when rendering
        PIXI.settings.RESOLUTION = window.devicePixelRatio;

        // Disable interpolation when scaling, will make texture be pixelated
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        PIXI.settings.ANISOTROPIC_LEVEL = 0;

        PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF;
        // PIXI.settings.ROUND_PIXELS = true;

        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
            antialias: false,
            forceFXAA: false,
            clearBeforeRender: true
        });

        this.grid = new LVLGridRenderer(this);
        this.mapContainer = new PIXI.Container();
        this.app.stage.addChild(this.mapContainer);
        this.app.stage.addChild(this.grid);

        this.container.appendChild(this.app.view);

        this.setDirty(true);

        let tick = 0;

        this.app.ticker.add((delta) => {

            this.stats.begin();

            this.grid.draw();

            // this.camera.update(delta);
            // this.map.update(delta);

            // this.update(delta);

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

    public isDirty(): boolean {
        return this.dirty;
    }

    public setDirty(flag: boolean): void {
        this.dirty = flag;
    }

}

export class LVLMapChunk {

    public static readonly LENGTH = 64;

    private tileMap: any;
    private view: LVLMapView;
    private readonly x: number;
    private readonly y: number;

    constructor(view: LVLMapView, x: number, y: number) {
        this.view = view;
        this.x = x;
        this.y = y;

        // @ts-ignore
        this.tileMap = new PIXI.tilemap.CompositeRectTileLayer(0,
            [
                // tilesetTexture,
                TileUtils.OVER1_TEXTURE,
                TileUtils.OVER2_TEXTURE,
                TileUtils.OVER3_TEXTURE,
                TileUtils.OVER4_TEXTURE,
                TileUtils.OVER5_TEXTURE,
                TileUtils.FLAG_TEXTURE,
                TileUtils.GOAL_TEXTURE,
                TileUtils.PRIZES_TEXTURE,
                TileUtils.EXTRAS_TEXTURE
            ]
        );

        this.view.map.tileset.texture;
    }

    public onUpdate(): void {

    }
}

export class LVLCamera implements Dirtable {

    private position: Vector2;
    private scale: number;
    private upArrowListener: KeyListener;
    private downArrowListener: KeyListener;
    private leftArrowListener: KeyListener;
    private rightArrowListener: KeyListener;

    private dirty: boolean;

    /**
     * Main constructor.
     */
    constructor() {

        let center: number = (LVL.MAP_LENGTH) / 2;
        let cx: number = 0;
        let cy: number = 0;

        // Set the initial position to be the center of the map with the default scale.
        this.position = new Vector2(cx, cy);
        this.scale = 1.0;

        this.upArrowListener = new KeyListener("ArrowUp");
        this.downArrowListener = new KeyListener("ArrowDown");
        this.leftArrowListener = new KeyListener("ArrowLeft");
        this.rightArrowListener = new KeyListener("ArrowRight");

        let oneListener = new KeyListener("1", () => {
            this.position.x = 0;
            this.position.y = 0;
            this.setDirty(true);
        });

        let twoListener = new KeyListener("2", () => {
            this.position.x = 1023;
            this.position.y = 0;
            this.setDirty(true);
        });

        let threeListener = new KeyListener("3", () => {
            this.position.x = 0;
            this.position.y = 1023;
            this.setDirty(true);
        });

        let fourListener = new KeyListener("4", () => {
            this.position.x = 1023;
            this.position.y = 1023;
            this.setDirty(true);
        });

        let fiveListener = new KeyListener("5", () => {
            this.position.x = 512;
            this.position.y = 512;
            this.setDirty(true);
        });

    }

    public update(delta: number): boolean {

        if (this.upArrowListener.isDown != this.downArrowListener.isDown) {

            if (this.upArrowListener.isDown) {
                this.position.y -= 1;
                this.setDirty(true);
            }

            if (this.downArrowListener.isDown) {
                this.position.y += 1;
                this.setDirty(true);
            }

        }

        if (this.leftArrowListener.isDown != this.rightArrowListener.isDown) {

            if (this.leftArrowListener.isDown) {
                this.position.x -= 1;
                this.setDirty(true);
            }

            if (this.rightArrowListener.isDown) {
                this.position.x += 1;
                this.setDirty(true);
            }

        }

        return true;
    }

    /**
     * @Return Returns a copy of the position of the camera.
     * <br><b>NOTE:</b> Modifying this copy will not modify the position of the camera.
     */
    public getPosition(): Vector2 {
        return new Vector2(this.position.x, this.position.y);
    }

    /**
     *
     * @param x The x-coordinate to set.
     * @param y The y-coordinate to set.
     */
    public setPosition(x: number, y: number): void {
        this.position.x = x; // Math.floor(x);
        this.position.y = y; // Math.floor(y);
        this.setDirty(true);
    }

    /**
     * @return Returns the scale of the camera.
     */
    public getScale(): number {
        return this.scale;
    }

    /**
     * Sets the scale of the camera.
     *
     * @param value The value to set.
     */
    public setScale(value: number): void {
        this.scale = value;
        this.setDirty(true);
    }

    isDirty(): boolean {
        return this.dirty;
    }

    setDirty(flag: boolean): void {
        this.dirty = flag;
    }
}

export class LVLGridRenderer extends PIXI.Container {

    private view: LVLMapView;
    private renderBaseGrid: boolean;
    private renderAxisLines: boolean;
    private renderBorderLines: boolean;

    constructor(view: LVLMapView) {

        super();

        this.view = view;
        this.renderBaseGrid = true;
        this.renderAxisLines = true;
        this.renderBorderLines = true;
    }

    draw() {

        this.removeChildren();

        // Grab the dimensions of the app view.
        let sw = Math.floor(this.view.app.view.width);
        let sh = Math.floor(this.view.app.view.height);
        let sw2 = sw / 2;
        let sh2 = sh / 2;

        // Grab the camera's position on the app view.
        let camPos = this.view.camera.getPosition();
        let cx = camPos.x * 16.0;
        let cy = camPos.y * 16.0;

        // Grab the edge coordinates of the view.
        let x1 = Math.floor(cx - sw2);
        let y1 = Math.floor(cy - sh2);
        let x2 = Math.floor(cx + sw2);
        let y2 = Math.floor(cy + sh2);

        let center = 512 * 16;
        let screenCenterX = center - x1;
        let screenCenterY = center - y1;

        let left = -x1;
        let top = -y1;
        let right = (1023 * 16) - x1;
        let bottom = (1023 * 16) - y1;

        let startX = Math.floor(x1);
        let startY = Math.floor(y1);
        let endX = Math.ceil(x2);
        let endY = Math.ceil(y2);

        let offsetX = screenCenterX;
        let offsetY = screenCenterY;

        if (screenCenterX > 0) {
            while (offsetX >= 0) {
                offsetX -= 16;
            }
        } else if (screenCenterX < 0) {
            while (offsetX <= 0) {
                offsetX += 16;
            }
        }
        if (screenCenterY > 0) {
            while (offsetY >= 0) {
                offsetY -= 16;
            }
        } else if (screenCenterY < 0) {
            while (offsetY <= 0) {
                offsetY += 16;
            }
        }

        offsetX = Math.floor(offsetX);
        offsetY = Math.floor(offsetY);

        if (this.renderBaseGrid) {

            let baseGrid = new PIXI.Graphics();

            baseGrid.lineStyle(1, 0x444444, 0.33);

            // Horizontal lines.
            for (let y = Math.max(-offsetY, startY); y <= Math.min(1023 * 16, endY + 16); y += 16) {
                baseGrid.moveTo(Math.max(0, left), Math.floor((y - y1) + offsetY));
                baseGrid.lineTo(Math.min(right, sw), Math.floor((y - y1) + offsetY));
            }

            // Vertical lines.
            for (let x = Math.max(-offsetX, startX); x <= Math.min(1022 * 16, endX); x += 16) {
                baseGrid.moveTo(Math.floor((x - x1) + offsetX), Math.max(0, top));
                baseGrid.lineTo(Math.floor((x - x1) + offsetX), Math.min(sh, bottom));
            }

            this.addChild(baseGrid);
        }

        if (this.renderAxisLines) {

            let centerLines = new PIXI.Graphics();
            centerLines.lineStyle(1, 0x7777ff, 1);

            let drawCenterX = screenCenterX > 0 && screenCenterX <= sw;
            let drawCenterY = screenCenterY > 0 && screenCenterY <= sh;

            if (drawCenterX) {
                centerLines.moveTo(Math.floor(screenCenterX), Math.max(0, top));
                centerLines.lineTo(Math.floor(screenCenterX), Math.min(sh, bottom));
            }

            if (drawCenterY) {
                centerLines.moveTo(Math.max(0, left), Math.floor(screenCenterY));
                centerLines.lineTo(Math.min(right, sw), Math.floor(screenCenterY));
            }

            this.addChild(centerLines);

        }

        if (this.renderBorderLines) {

            let borderLines = new PIXI.Graphics();

            borderLines.lineStyle(1.5, 0x7777ff, 1);

            let drawLeft = left > 0 && left <= sw;
            let drawTop = top > 0 && top <= sh;
            let drawRight = right > 0 && right <= sw;
            let drawBottom = bottom > 0 && bottom <= sh;

            if (drawLeft) {
                borderLines.moveTo(Math.floor(left), Math.max(0, top));
                borderLines.lineTo(Math.floor(left), Math.min(sh, bottom));
            }

            if (drawTop) {
                borderLines.moveTo(Math.max(0, left), Math.floor(top));
                borderLines.lineTo(Math.min(right, sw), Math.floor(top));
            }

            if (drawRight) {
                borderLines.moveTo(Math.floor(right), Math.max(0, top));
                borderLines.lineTo(Math.floor(right), Math.min(sh, bottom));
            }

            if (drawBottom) {
                borderLines.moveTo(Math.max(0, left), Math.floor(bottom));
                borderLines.lineTo(Math.min(right, sw), Math.floor(bottom));
            }

            this.addChild(borderLines);
        }

        this.updateTransform();
    }

}
