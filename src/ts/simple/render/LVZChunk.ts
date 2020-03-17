import * as PIXI from "pixi.js";
import { LayerCluster, MapRenderer } from './MapRenderer';
import { CompiledLVZImage, CompiledLVZMapObject } from '../../io/LVZ';
import { MapSprite } from './MapSprite';
import { Session } from '../Session';
import { Camera } from '../../common/Renderer';

/**
 * The <i>LVZChunk</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZChunk {

    public static readonly LENGTH = 64;

    readonly x: number;
    readonly y: number;

    private bounds: PIXI.Rectangle;
    private renderer: MapRenderer;
    private animatedObjects: LVZChunkEntry[];
    private objects: LVZChunkEntry[];

    /**
     * Main constructor.
     *
     * @param renderer
     * @param x
     * @param y
     */
    constructor(renderer: MapRenderer, x: number, y: number) {

        this.renderer = renderer;
        this.x = x;
        this.y = y;

        this.objects = [];
        this.animatedObjects = [];
        this.bounds = new PIXI.Rectangle(0, 0, 0, 0);
    }

    onUpdate(): void {

        let session = this.renderer.session;
        if (session == null) {
            return;
        }

        let packages = session.lvzManager.packages;
        if (packages == null || packages.length === 0) {
            return;
        }

        let camera = this.renderer.camera;
        if (camera.isDirty() && this.contains(camera)) {
            this.drawAnimated();
        }
    }

    private contains(camera: Camera): boolean {

        let cpos = camera.position;
        let cx = cpos.x * 16;
        let cy = cpos.y * 16;
        let scale = cpos.scale;
        let invScale = 1 / scale;
        let sw = this.renderer.app.view.width;
        let sh = this.renderer.app.view.height;

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

        return !(bx2 < cx1 || bx1 > cx2) && !(by2 < cy1 || by1 > cy2);
    }

    private drawAnimated(): void {

        for (let index = 0; index < this.animatedObjects.length; index++) {

            let next = this.animatedObjects[index];
            if (next.sprite == null) {
                continue;
            }

            if (next.sprite.sequence != null) {
                let offset = next.sprite.offset;
                if (next.sprite.sequence.length > offset) {
                    let texture = next.sprite.sequence[next.sprite.offset];
                    if (texture != null) {
                        next._sprite.texture = texture;
                        next._sprite.visible = true;
                    } else {
                        next._sprite.visible = false;
                    }
                }
            } else {
                next._sprite.visible = false;
            }
        }
    }

    build(session: Session, cluster: LayerCluster): void {

        let atlas = session.atlas;
        let packages = session.lvzManager.packages;

        let getNearbyPixels = (x1: number, y1: number, x2: number, y2: number): { packageName: string, image: CompiledLVZImage, object: CompiledLVZMapObject }[] => {
            let objects: { packageName: string, image: CompiledLVZImage, object: CompiledLVZMapObject }[] = [];
            for (let index = 0; index < packages.length; index++) {
                let next = packages[index];

                for (let index2 = 0; index2 < next.mapObjects.length; index2++) {
                    let nextObject = next.mapObjects[index2];
                    let x = nextObject.x;
                    let y = nextObject.y;

                    let image = next.images[nextObject.image];

                    if (x1 <= x && x <= x2 && y1 <= y && y <= y2) {
                        objects.push({packageName: next.name, image: image, object: nextObject});
                    }
                }
            }

            return objects;
        };

        let getNearbyTiles = (x1: number, y1: number, x2: number, y2: number): { packageName: string, image: CompiledLVZImage, object: CompiledLVZMapObject }[] => {
            return getNearbyPixels(x1 * 16, y1 * 16, x2 * 16, y2 * 16);
        };

        if (this.objects.length !== 0) {
            for (let index = 0; index < this.objects.length; index++) {
                let next = this.objects[index];
                cluster.layers[next.object.layer].removeChild(next._sprite);
            }
            this.objects = [];
        }

        if (this.animatedObjects.length !== 0) {
            for (let index = 0; index < this.animatedObjects.length; index++) {
                let next = this.animatedObjects[index];
                cluster.layers[next.object.layer].removeChild(next._sprite);
            }
            this.animatedObjects = [];
        }

        let minX = 999999;
        let minY = 999999;
        let maxX = -999999;
        let maxY = -999999;

        let x1 = this.x * 64;
        let y1 = this.y * 64;
        let x2 = (this.x + 1) * 64;
        let y2 = (this.y + 1) * 64;

        let objects = getNearbyTiles(x1, y1, x2, y2);

        for (let index = 0; index < objects.length; index++) {

            let packageName = objects[index].packageName;
            let object = objects[index].object;
            let image = objects[index].image;
            let x = object.x;
            let y = object.y;

            let mapSprite = atlas.getSpriteById(packageName + '>>>' + object.image);

            if (mapSprite == null) {
                continue;
            }

            let _sprite = new PIXI.Sprite();
            _sprite.x = x;
            _sprite.y = y;

            _sprite.interactive = false;

            let profile = {
                object: object,
                sprite: mapSprite,
                texture: -1,
                _sprite: _sprite
            };

            cluster.layers[object.layer].addChild(_sprite);

            if ((image.xFrames > 1 || image.yFrames > 1) && image.animationTime !== 0) {
                this.animatedObjects.push(profile);
            } else {
                _sprite.cacheAsBitmap = true;
                this.objects.push(profile);
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
}

/**
 * The <i>LVZChunkEntry</i> interface. TODO: Document.
 */
interface LVZChunkEntry {
    object: CompiledLVZMapObject,
    sprite: MapSprite,
    texture: number,
    _sprite: PIXI.Sprite
}
