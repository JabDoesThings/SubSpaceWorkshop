import { LVLBorder, LVLChunk } from './LVLRender';
import * as PIXI from "pixi.js";

import { LVLArea, LVLMap } from '../../io/LVL';
import { MapSpriteCollection } from './MapSprite';
import { MapGrid } from './MapGrid';
import { LVZCollection, LVZMapObject } from '../../io/LVZ';
import { LVLSpriteCollection } from './LVLSpriteCollection';
import { LVZChunk } from './LVZChunk';
import { ELVLRegionRender } from './ELVLRegionRender';
import { MapRadar } from './MapRadar';
import { TilesetWindow } from './TilesetWindow';
import { MapMouseEvent, MapMouseEventType, Renderer } from '../../common/Renderer';
import { Radar } from '../../common/Radar';
import { PathMode } from '../../util/Path';
import { Background } from '../../common/Background';

/**
 * The <i>SimpleRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapRenderer extends Renderer {

    readonly lvlSprites: LVLSpriteCollection;
    readonly lvzSprites: MapSpriteCollection;
    map: LVLMap;
    lvz: LVZCollection;

    background: Background;
    private chunks: LVLChunk[][];
    private lvzChunks: LVZChunk[][];
    private regions: ELVLRegionRender[];
    private elvlContainer: PIXI.Container;

    grid: MapGrid;
    _border: LVLBorder;
    _map: PIXI.Container;
    _lvz: PIXI.Container;

    radar: Radar;

    tilesetWindow: TilesetWindow;

    tab: HTMLDivElement;

    public constructor() {

        super();

        this.lvlSprites = new LVLSpriteCollection();
        this.lvzSprites = new MapSpriteCollection();
        this.radar = new MapRadar(this);
    }

    // @Override
    protected onInit(): void {

        this.grid = new MapGrid(this);
        this.grid.filters = [];
        this.grid.filterArea = this.app.renderer.screen;
        // this.grid.visible = false;

        this.background = new Background(this, 0);

        this.elvlContainer = new PIXI.Container();
        this.elvlContainer.alpha = 0.2;

        this._border = new LVLBorder(this);

        this._map = new PIXI.Container();
        this._map.filters = [Renderer.chromaFilter];
        this._map.filterArea = this.app.renderer.screen;

        this._lvz = new PIXI.Container();
        this._lvz.filters = [Renderer.chromaFilter];
        this._lvz.filterArea = this.app.renderer.screen;

        this.tilesetWindow = new TilesetWindow(this);

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

        let stage = this.app.stage;
        stage.addChild(this.background);
        stage.addChild(this.elvlContainer);
        stage.addChild(this._border);
        stage.addChild(this.grid);
        stage.addChild(this._map);
        stage.addChild(this._lvz);

        this.radar.draw().then(() => {
            this.radar.apply();
        });

        this.tilesetWindow.draw();

        let drawn = false;
        let downPrimary = false;
        let downSecondary = false;

        let scales = [
            2,
            1,
            0.5,
            0.25,
            0.1
        ];

        let scaleIndex = 1;

        this.events.addMouseListener((event: MapMouseEvent) => {

            if (event.type !== MapMouseEventType.WHEEL_UP && event.type !== MapMouseEventType.WHEEL_DOWN) {
                return;
            }

            let path = this.camera.path;
            let active = path.isActive();
            if (active && path.tick / path.ticks < 0.1) {
                return;
            }

            let sx = event.e.offsetX;
            let sy = event.e.offsetY;
            let sw = this.app.screen.width;
            let sh = this.app.screen.height;

            let mapSpace = this.camera.toMapSpace(sx, sy, sw, sh, this.camera.position.scale * 2);

            let x = mapSpace.tileX;
            let y = mapSpace.tileY;

            if (x < 0) {
                x = 0;
            } else if (x > 1023) {
                x = 1023;
            }

            if (y < 0) {
                y = 0;
            } else if (y > 1023) {
                y = 1023;
            }

            if (event.type == MapMouseEventType.WHEEL_DOWN) {
                scaleIndex++;
            } else {
                scaleIndex--;
            }

            if (scaleIndex < 0) {
                scaleIndex = 0;
            } else if (scaleIndex > scales.length - 1) {
                scaleIndex = scales.length - 1;
            }

            let ticks = active ? 20 : 30;
            this.camera.pathTo({x: x, y: y, scale: scales[scaleIndex]}, ticks, PathMode.EASE_OUT);
        });

        this.events.addMouseListener((event: MapMouseEvent): void => {

            if (this.map == null) {
                return;
            }

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

                let tileId = downPrimary ? this.tilesetWindow.primary : this.tilesetWindow.secondary;

                this.map.setTile(x, y, tileId);
                drawn = true;
            }
        });
    }

    // @Override
    protected onPreUpdate(delta: number): void {
        this.lvlSprites.update();
        this.lvzSprites.update();
    }

    // @Override
    public onUpdate(delta: number): boolean {

        if (this.camera.isDirty()) {
            if (this.background.visible) {
                this.background.update();
            }
            this._border.update();
            if (this.grid.visible) {
                this.grid.draw();
            }
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

        if (this.map != null) {

            this.map.setDirty(false);

            if (this.map.tileset != null) {
                this.map.tileset.setDirty(false);
            }
        }

        if (this.lvz != null) {
            this.lvz.setDirty(false);
        }

        return true;
    }

    // @Override
    public isDirty(): boolean {
        return super.isDirty() || this.camera.isDirty() || this.map.isDirty();
    }

    setMap(map: LVLMap) {

        this.map = map;

        this.regions = [];
        this._map.removeChildren();

        if (this.map == null) {
            console.log("Active map: none.");
        } else {
            console.log("Active map: " + this.map.name);
        }

        if (this.map != null) {

            // Create chunks to view.
            for (let x = 0; x < 16; x++) {
                for (let y = 0; y < 16; y++) {
                    this.chunks[x][y].init();
                    this._map.addChild(this.chunks[x][y].tileMap);
                    this._map.addChild(this.chunks[x][y].tileMapAnim);
                }
            }

            this.map.setDirty(true, new LVLArea(0, 0, 1023, 1023));
            let tileset = this.map.tileset;
            if (tileset != null) {
                tileset.setDirty(true);
            }

            let name = this.map.name;
            let seed = 0;
            for (let index = 0; index < name.length; index++) {
                seed += name.charCodeAt(index);
            }
            this.background.setSeed(seed);
            this.background.texLayer.draw();

            let elvl = map.getMetadata();
            let regions = elvl.getRegions();

            this.elvlContainer.removeChildren();

            if (regions.length != 0) {
                for (let index = 0; index < regions.length; index++) {

                    let next = regions[index];

                    let renderer = new ELVLRegionRender(this, next);
                    this.regions.push(renderer);
                }

                if (this.regions.length != 0) {
                    for (let index = 0; index < this.regions.length; index++) {
                        this.elvlContainer.addChild(this.regions[index].container);
                    }
                }
            }
        }

        this.tilesetWindow.draw();
        this.tilesetWindow.update();
        this.radar.draw().then(() => {
            this.radar.apply();
        });
    }

    setLvz(lvz: LVZCollection) {

        this.lvz = lvz;

        this._lvz.removeChildren();
        this.lvzSprites.clear();

        if (this.lvz != null) {

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
        }
    }
}
