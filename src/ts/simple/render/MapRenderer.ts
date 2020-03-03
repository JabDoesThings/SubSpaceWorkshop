import { LVLBorder, LVLChunk } from './LVLRender';
import * as PIXI from "pixi.js";

import { LVLMap } from '../../io/LVL';
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

/**
 * The <i>SimpleRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapRenderer extends Renderer {

    readonly lvlSprites: LVLSpriteCollection;
    readonly lvzSprites: MapSpriteCollection;
    readonly map: LVLMap;
    readonly lvz: LVZCollection;

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

    public constructor(map: LVLMap, lvz: LVZCollection = new LVZCollection()) {

        super();

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

        this.radar = new MapRadar(this);
    }

    // @Override
    protected onInit(): void {

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

        this.tilesetWindow = new TilesetWindow(this);

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

        let stage = this.app.stage;
        stage.addChild(this.elvlContainer);
        stage.addChild(this.grid);
        stage.addChild(this._border);
        stage.addChild(this._map);
        stage.addChild(this._lvz);

        this.radar.draw().then(() => {
            this.radar.apply();
        });

        this.tilesetWindow.draw();

        let drawn = false;
        let downPrimary = false;
        let downSecondary = false;

        this.events.addMouseListener((event: MapMouseEvent): void => {

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
            if (this.grid.visible) {
                this.grid.draw();
            }
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
