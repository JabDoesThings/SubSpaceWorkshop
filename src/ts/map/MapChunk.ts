import { UpdatedObject } from '../util/UpdatedObject';
import * as PIXI from "pixi.js";
import { LVL } from './lvl/LVLUtils';
import { MapView } from './MapView';

export class MapChunk extends UpdatedObject {

    public static readonly LENGTH = 64;

    tileMap: any;
    tileMapAnim: any;
    private view: MapView;
    private readonly x: number;
    private readonly y: number;

    private tilesAnim: { id: number, texture: number, x: number, y: number }[];

    constructor(view: MapView, x: number, y: number) {

        super();

        this.setRequireDirtyToUpdate(false);

        this.view = view;
        this.x = x;
        this.y = y;

        this.tilesAnim = [];

        // @ts-ignore
        this.tileMap = new PIXI.tilemap.CompositeRectTileLayer(0,
            [
                this.view.map.tileset.texture,
                LVL.EXTRAS_TEXTURE
            ]
        );

        // @ts-ignore
        this.tileMapAnim = new PIXI.tilemap.CompositeRectTileLayer(0,
            [
                this.view.map.tileset.texture,
                LVL.OVER1_TEXTURE,
                LVL.OVER2_TEXTURE,
                LVL.OVER3_TEXTURE,
                LVL.OVER4_TEXTURE,
                LVL.OVER5_TEXTURE,
                LVL.FLAG_TEXTURE,
                LVL.GOAL_TEXTURE,
                LVL.PRIZES_TEXTURE,
            ]
        );

        this.setDirty(true);
    }

    // @Override
    public isDirty(): boolean {
        return super.isDirty() || this.view.camera.isDirty() || this.view.map.isDirty();
    }

    // @Override
    public onUpdate(delta: number): boolean {

        let camera = this.view.camera;
        let map = this.view.map;
        let tiles = map.tiles;

        let tileset = map.tileset;

        if (camera.isDirty()) {
            let sw = this.view.app.view.width;
            let sh = this.view.app.view.height;
            let cpos = camera.getPosition();
            this.tileMap.x = this.tileMapAnim.x = Math.floor((-1 + ((this.x * 64) - (cpos.x * 16) + sw / 2)) - (this.x * 64));
            this.tileMap.y = this.tileMapAnim.y = 1 + Math.floor(((this.y * 64) - (cpos.y * 16) + sh / 2) - (this.y * 64));
        }

        if (map.isDirty()) {

            this.tileMap.clear();
            this.tilesAnim = [];

            // Go through each tile position on the raster and add tiles when present.
            for (let x = this.x * 64; x < (this.x + 1) * 64; x++) {
                for (let y = this.y * 64; y < (this.y + 1) * 64; y++) {

                    // Grab the next tile.
                    let tileId = tiles[x][y];

                    if (tileId > 0 && tileId <= 190) {

                        let tileCoordinates = tileset.getTileCoordinates(tileId);
                        let tu = tileCoordinates[0];
                        let tv = tileCoordinates[1];

                        if (tileId == 170) {
                            this.tilesAnim.push({
                                x: x * 16,
                                y: y * 16,
                                texture: 6,
                                id: tileId
                            });

                        } else if (tileId == 172) {
                            this.tilesAnim.push({
                                x: x * 16,
                                y: y * 16,
                                texture: 7,
                                id: tileId
                            });

                        } else {

                            // @ts-ignore
                            this.tileMap.addRect(0, tu, tv, x * 16, y * 16, 16, 16);

                        }

                    } else if ((tileId >= 216 && tileId <= 220) || tileId == 255) {

                        let texture = 0;
                        if (tileId == 216) {
                            texture = 1;
                        } else if (tileId == 217) {
                            texture = 2;
                        } else if (tileId == 218) {
                            texture = 3;
                        } else if (tileId == 219) {
                            texture = 4;
                        } else if (tileId == 220) {
                            texture = 5;
                        } else if (tileId == 255) {
                            texture = 8;
                        }

                        this.tilesAnim.push({
                            id: tileId,
                            texture: texture,
                            x: x * 16,
                            y: y * 16
                        });
                    } else {
                        let tileCoordinates = tileset.getTileCoordinates(tileId);
                        if (tileCoordinates != null) {
                            let tu = tileCoordinates[0];
                            let tv = tileCoordinates[1];
                            // @ts-ignore
                            this.tileMap.addRect(1, tu, tv, x * 16, y * 16, 16, 16);
                        }
                    }
                }
            }

        }

        this.tileMapAnim.clear();

        for (let index = 0; index < this.tilesAnim.length; index++) {

            let next = this.tilesAnim[index];

            // Grab the next tile.
            let id = next.id;
            let texture = next.texture;
            let x = next.x;
            let y = next.y;

            let frame = null;

            if (id == 170) {
                frame = this.view.mapSpriteFlag.current;
            } else if (id == 172) {
                frame = this.view.mapSpriteGoal.current;
            } else if (id == 216) {
                texture = 3;
                frame = this.view.mapSpriteOver1.current;
            } else if (id == 217) {
                frame = this.view.mapSpriteOver2.current;
            } else if (id == 218) {
                frame = this.view.mapSpriteOver3.current;
            } else if (id == 219) {
                frame = this.view.mapSpriteOver4.current;
            } else if (id == 220) {
                frame = this.view.mapSpriteOver5.current;
            }

            if (frame != null) {
                this.tileMapAnim.addRect(texture, frame[0], frame[1], x, y, frame[2], frame[3]);
            }
        }

        return true;
    }
}