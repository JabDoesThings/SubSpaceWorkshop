import * as PIXI from 'pixi.js';
import { Map } from './Map';
import { MapCamera } from './MapCamera';
import { UpdatedObject } from '../util/UpdatedObject';
import { MapUtils } from './MapUtils';
import { RasterMapObject } from './objects/RasterMapObject';

const Stats = require("stats.js");

export class MapViewer extends UpdatedObject {

    private renderBaseGrid: boolean = true;

    private htmlContainer: HTMLElement;
    private camera: MapCamera;
    private map: Map;
    private app: PIXI.Application;
    private gridContainer: PIXI.Container;
    private mapContainer: PIXI.Container;
    private stats: Stats;

    public constructor(htmlContainer: HTMLElement, map: Map) {

        super("map-viewer");

        this.map = map;

        this.htmlContainer = htmlContainer;
        this.camera = new MapCamera();

        this.initPixi();

    }

    // @Override
    protected onUpdate(delta: number): boolean {
        this.map.update(delta);
        this.draw();
        return true;
    }

    private draw() {
        this.drawGrid();
        this.drawMap();
    }

    private drawGrid() {

        this.gridContainer.removeChildren();

        // Grab the dimensions of the app view.
        let sw = Math.floor(this.app.view.width);
        let sh = Math.floor(this.app.view.height);
        let sw2 = sw / 2;
        let sh2 = sh / 2;

        // Grab the camera's position on the app view.
        let camPos = this.camera.getPosition();
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

        let startX = Math.floor(x1);
        let startY = Math.floor(y1);
        let endX = Math.ceil(x2);
        let endY = Math.ceil(y2);

        let offsetX = screenCenterX;
        let offsetY = screenCenterY;

        while (offsetX >= 0) {
            offsetX -= 16;
        }

        while (offsetY >= 0) {
            offsetY -= 16;
        }

        offsetX = Math.floor(offsetX);
        offsetY = Math.floor(offsetY);

        if (this.renderBaseGrid) {
            let baseGrid = new PIXI.Graphics();
            baseGrid.lineStyle(1, 0x444444, 0.5);

            // Move it to the beginning of the line.
            baseGrid.position.set(0, 0);

            for (let y = startY; y <= endY + 16; y += 16) {

                baseGrid.moveTo(0, Math.floor((y - y1) + offsetY));
                baseGrid.lineTo(sw, Math.floor((y - y1) + offsetY));

            }

            for (let x = startX; x <= endX + 16; x += 16) {

                baseGrid.moveTo(Math.floor((x - x1) + offsetX), 0);
                baseGrid.lineTo(Math.floor((x - x1) + offsetX), sh);

            }

            this.gridContainer.addChild(baseGrid);
        }

        let centerLines = new PIXI.Graphics();
        centerLines.lineStyle(1, 0x7777ff, 1);

        let drawCenterX = screenCenterX > 0 && screenCenterX <= sw;
        let drawCenterY = screenCenterY > 0 && screenCenterY <= sh;

        if (drawCenterX) {
            centerLines.moveTo(Math.floor(screenCenterX), 0);
            centerLines.lineTo(Math.floor(screenCenterX), sh);
        }

        if (drawCenterY) {
            centerLines.moveTo(0, Math.floor(screenCenterY));
            centerLines.lineTo(sw, Math.floor(screenCenterY));
        }

        this.gridContainer.addChild(centerLines);
        this.gridContainer.updateTransform();

    }

    private drawMap() {

        // Grab the dimensions of the app view.
        let sw = Math.floor(this.app.view.width);
        let sh = Math.floor(this.app.view.height);
        let sw2 = sw / 2;
        let sh2 = sh / 2;

        // Grab the camera's position on the app view.
        let camPos = this.camera.getPosition();
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

        let startX = Math.floor(x1);
        let startY = Math.floor(y1);
        let endX = Math.ceil(x2);
        let endY = Math.ceil(y2);

        let offsetX = screenCenterX;
        let offsetY = screenCenterY;

        while (offsetX >= 0) {
            offsetX -= 16;
        }

        while (offsetY >= 0) {
            offsetY -= 16;
        }

        offsetX = Math.floor(offsetX);
        offsetY = Math.floor(offsetY);

        // Clean all items for the map side of the render.
        this.mapContainer.removeChildren();

        // let tileset = this.map.getTileset();
        // let sprite = new PIXI.Sprite(tileset.getTile(170));
        //
        // sprite.x = 32;
        // sprite.y = 32;

        let layers = this.map.getLayers();

        for (let key in layers) {

            let layer = layers[key];

            let raster: RasterMapObject = null;

            if (layer instanceof RasterMapObject) {
                raster = layer;
            } else {
                // TODO: Grab raster from other objects.
            }

            if (raster != null) {
                let tilemap = raster.getTileMap();

                // @ts-ignore
                tilemap.x = -x1;
                tilemap.y = -y1;

                console.log("tilemap.x = " + tilemap.x + " tilemap.y = " + tilemap.y);

                // raster.transform.set(cx, cy);

                this.mapContainer.addChild(tilemap);
            }

        }

    }

    private initPixi() {

        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style.top = "calc(100% - 48px)";
        this.stats.dom.style.left = "calc(100% - 80px)";
        this.htmlContainer.appendChild(this.stats.dom);

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

        this.gridContainer = new PIXI.Container();
        this.mapContainer = new PIXI.Container();
        this.app.stage.addChild(this.mapContainer);
        this.app.stage.addChild(this.gridContainer);

        this.htmlContainer.appendChild(this.app.view);

        this.setDirty(true);

        let tick = 0;

        this.app.ticker.add((delta) => {

            this.stats.begin();


            // let value = (Math.PI * 2.0) * (tick++ / 300);
            // let offsetX = Math.cos(value) * 8;
            // let offsetY = Math.sin(value) * 8;
            // let center = MapUtils.MAP_LENGTH / 2;
            // let cx = center + offsetX;
            // let cy = center + offsetY;
            // this.camera.setPosition(cx, cy);
            // this.setDirty(true);

            this.update(delta);

            this.stats.end();
        });

        let ctx = this;

        // Resize function window
        function resize() {

            let parent = ctx.htmlContainer;
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

    // public constructor() {
    //
    //     const app = new PIXI.Application({
    //         width: 800, height: 600, backgroundColor: 0x000000, resolution: window.devicePixelRatio || 1,
    //     });
    //
    //     const container = new PIXI.Container();
    //
    //     app.stage.addChild(container);
    //
    //     // Create a new texture
    //     let texture = PIXI.Texture.from('assets/media/default_tileset.bmp');
    //
    //     let sprite = new PIXI.Sprite(texture);
    //     sprite.anchor.set(0);
    //     sprite.x = 0;
    //     sprite.y = 0;
    //
    //     let myGraph = new PIXI.Graphics();
    //     myGraph.lineStyle(1, 0xffffff, 0.5);
    //
    //     // Move it to the beginning of the line.
    //     myGraph.position.set(0, 0);
    //
    //     for (let y = 0; y <= 10; y++) {
    //         let yPosition = 16 * y;
    //         myGraph.moveTo(0, yPosition);
    //         myGraph.lineTo(304, yPosition);
    //     }
    //
    //     for (let x = 0; x <= 19; x++) {
    //         let xPosition = 16 * x;
    //         myGraph.moveTo(xPosition, 0);
    //         myGraph.lineTo(xPosition, 160);
    //     }
    //
    //     container.addChild(sprite);
    //     container.addChild(myGraph);
    //
    //     // Move container to the center
    //     container.x = 16;
    //     container.y = 16;
    //
    //     // Center bunny sprite in local container coordinates
    //     container.pivot.x = 0;
    //     container.pivot.y = 0;
    //
    //     document.getElementById("map-viewer-container").appendChild(app.view);
    //
    // }

    public getMap(): Map {
        return this.map;
    }
}
