import * as PIXI from "pixi.js";
import { MapRenderer } from './MapRenderer';
import { LVZMapObject } from '../../io/LVZ';
import { MapSprite } from './MapSprite';

/**
 * The <i>LVZChunkEntry</i> interface. TODO: Document.
 */
interface LVZChunkEntry {
    object: LVZMapObject,
    sprite: MapSprite,
    texture: number,
    _sprite: PIXI.Sprite
}

/**
 * The <i>LVZChunk</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZChunk {

    public static readonly LENGTH = 64;

    container: PIXI.Container;

    private view: MapRenderer;
    private readonly x: number;
    private readonly y: number;

    bounds: PIXI.Rectangle;

    private animatedObjects: LVZChunkEntry[];

    constructor(view: MapRenderer, x: number, y: number) {

        this.view = view;
        this.x = x;
        this.y = y;

        this.animatedObjects = [];

        this.container = new PIXI.Container();
        this.bounds = new PIXI.Rectangle(0, 0, 0, 0);
    }

    public onUpdate(): void {

        let session = this.view.session;
        if (session == null) {
            return;
        }
        let lvz = session.cache.lvz;
        if (lvz == null) {
            return;
        }

        let draw = (objects: LVZChunkEntry[]) => {

            for (let index = 0; index < objects.length; index++) {

                let next = objects[index];

                if (next.sprite.sequence != null) {
                    let offset = next.sprite.offset;
                    if (next.sprite.sequence.length > offset) {
                        next._sprite.texture = next.sprite.sequence[next.sprite.offset];
                        this.container.addChild(next._sprite);
                    }
                }
            }
        };

        let camera = this.view.camera;

        let contains = (): boolean => {

            let cpos = camera.position;
            let cx = cpos.x * 16;
            let cy = cpos.y * 16;
            let scale = cpos.scale;
            let invScale = 1 / scale;
            let sw = this.view.app.view.width;
            let sh = this.view.app.view.height;

            let sw2 = (sw / 2) * invScale;
            let sh2 = (sh / 2) * invScale;

            let cx1 = cx - sw2;
            let cy1 = cy - sh2;
            let cx2 = cx + sw2;
            let cy2 = cy + sh2;

            let bx1 = this.bounds.x;
            let by1 = this.bounds.y;
            let bx2 = this.bounds.x + this.bounds.width;
            let by2 = this.bounds.y + this.bounds.height;

            if (bx2 < cx1 || bx1 > cx2) {
                return false;
            }

            if (by2 < cy1 || by1 > cy2) {
                return false;
            }

            return true;
        };

        let cpos = camera.position;
        let cx = cpos.x * 16;
        let cy = cpos.y * 16;
        let scale = cpos.scale;

        if (camera.isDirty()) {
            let invScale = 1 / scale;
            let sw = this.view.app.view.width * invScale;
            let sh = this.view.app.view.height * invScale;
            this.container.x = Math.floor((-1 + ((this.x * 64) - cx + sw / 2)) - (this.x * 64));
            this.container.y = 1 + Math.floor(((this.y * 64) - cy + sh / 2) - (this.y * 64));
            this.container.x *= scale;
            this.container.y *= scale;
            this.container.scale.x = scale;
            this.container.scale.y = scale;
        }

        if (lvz.isDirty()) {

            let minX = 999999;
            let minY = 999999;
            let maxX = -999999;
            let maxY = -999999;

            let x1 = this.x * 64;
            let y1 = this.y * 64;
            let x2 = (this.x + 1) * 64;
            let y2 = (this.y + 1) * 64;

            let staticObjects = [];
            this.animatedObjects = [];

            this.container.removeChildren();

            let objects = lvz.getNearbyTiles(x1, y1, x2, y2);

            for (let index = 0; index < objects.length; index++) {

                let next = objects[index];
                let x = next.x;
                let y = next.y;

                let _sprite = new PIXI.Sprite();
                _sprite.x = x;
                _sprite.y = y;

                let profile = {
                    object: next, sprite: next.image.getSprite(), texture: -1,
                    _sprite: _sprite
                };

                if (next.image.isAnimated()) {
                    this.animatedObjects.push(profile);
                } else {
                    staticObjects.push(profile);
                }

                if (minX > x) {
                    minX = x;
                }
                if (maxX < x) {
                    maxX = x;
                }
                if (minY > y) {
                    minY = y;
                }
                if (maxY < y) {
                    maxY = y;
                }
            }

            this.bounds.x = minX;
            this.bounds.y = minY;
            this.bounds.width = maxX - minX;
            this.bounds.height = maxY - minY;
        }

        if (contains()) {
            draw(this.animatedObjects);
        }
    }
}
