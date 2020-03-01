import { UpdatedObject } from '../../util/UpdatedObject';
import * as PIXI from "pixi.js";
import { LVL } from '../../io/LVLUtils';
import { Renderer } from './Renderer';
import { LVLArea } from '../../io/LVL';

/**
 * The <i>LVZChunkEntry</i> interface. TODO: Document.
 */
interface LVLChunkEntry {
    id: number,
    texture: number,
    x: number,
    y: number
}

/**
 * The <i>MapChunk</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVLChunk extends UpdatedObject {

    public static readonly LENGTH = 64;

    tileMap: any;
    tileMapAnim: any;
    private view: Renderer;
    private readonly x: number;
    private readonly y: number;

    private area: LVLArea;

    private tilesAnim: LVLChunkEntry[];

    constructor(view: Renderer, x: number, y: number) {

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

        this.area = new LVLArea(x * 64, y * 64, ((x + 1) * 64) - 1, ((y + 1) * 64) - 1);

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

        if (map.isDirty() && map.containsDirtyArea(this.area.x1, this.area.y1, this.area.x2, this.area.y2)) {

            // console.log("Drawing MapChunk: " + this.area);

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

                        if (tileId >= 162 && tileId <= 165) {
                            this.tilesAnim.push({
                                x: x * 16,
                                y: y * 16,
                                texture: 0,
                                id: tileId
                            });
                        } else if (tileId >= 166 && tileId <= 169) {
                            this.tilesAnim.push({
                                x: x * 16,
                                y: y * 16,
                                texture: 0,
                                id: tileId
                            });
                        } else if (tileId == 170) {
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

                        }
                            // These tiles are see-through in-game, so set these in animation tilemap
                        //       So that they are see-through.
                        else if (tileId >= 173 && tileId <= 190) {
                            this.tilesAnim.push({
                                x: x * 16,
                                y: y * 16,
                                texture: 0,
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

            let sprites = this.view.lvlSprites;

            if (id >= 162 && id <= 165) {
                frame = sprites.mapSpriteDoor1.current;
            } else if (id >= 166 && id <= 169) {
                frame = sprites.mapSpriteDoor2.current;
            } else if (id == 170) {
                frame = sprites.mapSpriteFlag.current;
            } else if (id == 172) {
                frame = sprites.mapSpriteGoal.current;
            } else if (id == 216) {
                texture = 3;
                frame = sprites.mapSpriteOver1.current;
            } else if (id == 217) {
                frame = sprites.mapSpriteOver2.current;
            } else if (id == 218) {
                frame = sprites.mapSpriteOver3.current;
            } else if (id == 219) {
                frame = sprites.mapSpriteOver4.current;
            } else if (id == 220) {
                frame = sprites.mapSpriteOver5.current;
            }

            if (frame != null) {
                this.tileMapAnim.addRect(texture, frame[0], frame[1], x, y, frame[2], frame[3]);
            } else {
                let tileCoordinates = tileset.getTileCoordinates(next.id);
                let tu = tileCoordinates[0];
                let tv = tileCoordinates[1];
                this.tileMapAnim.addRect(texture, tu, tv, x, y, 16, 16);
            }
        }

        return true;
    }
}

export class LVLBorder extends PIXI.Container {

    private view: Renderer;

    constructor(view: Renderer) {
        super();

        this.view = view;

        this.draw();
    }

    update(): void {

        let camera = this.view.camera;

        if (camera.isDirty()) {
            let sw = this.view.app.view.width;
            let sh = this.view.app.view.height;
            let cPos = camera.getPosition();
            let cx = (cPos.x * 16) - (sw / 2.0);
            let cy = (cPos.y * 16) - (sh / 2.0);

            this.x = -16 - cx;
            this.y = -16 - cy;
        }
    }

    draw(): void {

        this.removeChildren();

        let borderTexture = this.view.map.tileset.borderTile;

        let sprite: PIXI.Sprite;

        for (let index = 1; index < 1025; index++) {

            // TOP
            let sprite = new PIXI.Sprite(borderTexture);
            sprite.x = index * 16;
            sprite.y = 0;
            this.addChild(sprite);

            // BOTTOM
            sprite = new PIXI.Sprite(borderTexture);
            sprite.x = index * 16;
            sprite.y = 16400;
            this.addChild(sprite);

            // LEFT
            sprite = new PIXI.Sprite(borderTexture);
            sprite.x = 0;
            sprite.y = index * 16;
            this.addChild(sprite);

            // RIGHT
            sprite = new PIXI.Sprite(borderTexture);
            sprite.x = 16400;
            sprite.y = index * 16;
            this.addChild(sprite);
        }

        // TOP-LEFT
        sprite = new PIXI.Sprite(borderTexture);
        sprite.x = 0;
        sprite.y = 0;
        this.addChild(sprite);

        // TOP-RIGHT
        sprite = new PIXI.Sprite(borderTexture);
        sprite.x = 16400;
        sprite.y = 0;
        this.addChild(sprite);

        // BOTTOM-RIGHT
        sprite = new PIXI.Sprite(borderTexture);
        sprite.x = 16400;
        sprite.y = 16400;
        this.addChild(sprite);

        // BOTTOM-LEFT
        sprite = new PIXI.Sprite(borderTexture);
        sprite.x = 0;
        sprite.y = 16400;
        this.addChild(sprite);
    }
}
