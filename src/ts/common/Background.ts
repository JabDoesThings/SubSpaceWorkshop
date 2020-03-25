import * as PIXI from "pixi.js";
import { MapRenderer } from '../simple/render/MapRenderer';
import { Renderer } from './Renderer';
import { SeededRandom } from '../util/SeededRandom';
import { Project } from '../simple/Project';

/**
 * The <i>Background</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Background extends PIXI.Container {

    view: Renderer;
    g: PIXI.Graphics;

    private layer1: StarFieldLayer;
    private layer2: StarFieldLayer;
    texLayer: BackgroundObjectLayer;
    private lw: number;
    private lh: number;
    random: SeededRandom;
    seed: number;
    project: Project;
    private dirty: boolean;

    constructor(project: Project, view: Renderer, seed: number) {

        super();

        this.project = project;
        this.view = view;
        this.setSeed(seed);

        this.filters = [];
        this.filterArea = view.app.screen;

        this.g = new PIXI.Graphics();
        this.lw = -1;
        this.lh = -1;

        this.dirty = true;

        this.draw();
    }

    draw(): void {

        this.removeChildren();

        this.random = new SeededRandom(this.seed);

        this.layer1 = new StarFieldLayer(this, 0x606060, 8);
        this.layer2 = new StarFieldLayer(this, 0xB8B8B8, 6);
        this.texLayer = new BackgroundObjectLayer(this);

        // this.addChild(this.g);
        this.addChild(this.layer1);
        this.addChild(this.layer2);
        this.addChild(this.texLayer);

        this.dirty = false;
    }

    update(): void {

        if (this.dirty) {
            this.draw();
        }

        let camera = this.view.camera;

        let screen = this.view.app.screen;
        if (screen.width != this.lw || screen.height != this.lh) {

            this.g.clear();
            this.g.beginFill(0x000000);
            this.g.drawRect(0, 0, screen.width, screen.height);
            this.g.endFill();

            this.lw = screen.width;
            this.lh = screen.height;
        }

        let scale = camera.position.scale;

        let alpha = 1;
        if (scale >= 0.25 && scale <= 0.5) {
            alpha = (scale - 0.25) * 4;
            if (alpha > 1) {
                alpha = 1;
            } else if (alpha < 0) {
                alpha = 0;
            }
        } else if (scale < 0.25) {
            alpha = 0;
        }
        this.alpha = alpha;

        if (this.alpha == 0) {
            return;
        }

        if (camera.isDirty()) {

            this.texLayer.update();
            let cpos = camera.position;
            let scale = cpos.scale;
            let invScale = 1 / scale;
            let sw2 = invScale * (this.view.app.screen.width / 2.0);
            let sh2 = invScale * (this.view.app.screen.height / 2.0);
            let cx = (cpos.x * 16);
            let cy = (cpos.y * 16);

            this.layer1.x = (sw2 + (-(cx / this.layer1._scale))) * scale;
            this.layer1.y = (sh2 + (-(cy / this.layer1._scale))) * scale;
            this.layer1.scale.x = scale;
            this.layer1.scale.y = scale;

            this.layer2.x = (sw2 + (-(cx / this.layer2._scale))) * scale;
            this.layer2.y = (sh2 + (-(cy / this.layer2._scale))) * scale;
            this.layer2.scale.x = scale;
            this.layer2.scale.y = scale;
        }

        this.dirty = false;
    }

    setSeed(seed: number) {
        this.seed = seed;
        this.random = new SeededRandom(seed);
    }

    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }
}

/**
 * The <i>BackgroundObjectLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class BackgroundObjectLayer extends PIXI.Container {

    private background: Background;

    _scale: number;

    constructor(background: Background) {

        super();

        this.background = background;

        this._scale = 2;

        this.draw();

        this.filters = [MapRenderer.chromaFilter];
        this.filterArea = this.background.view.app.screen;
    }

    update(): void {
        let camera = this.background.view.camera;
        if (camera.isDirty()) {

            let cpos = camera.position;
            let cx = (cpos.x * 16) / this._scale;
            let cy = (cpos.y * 16) / this._scale;
            let scale = cpos.scale;
            let invScale = 1 / scale;

            let screen = this.background.view.app.screen;
            let sw = screen.width;
            let sh = screen.height;

            let sw2 = (sw / 2.0) * invScale;
            let sh2 = (sh / 2.0) * invScale;

            for (let key in this.children) {

                let next = this.children[key];

                // @ts-ignore
                let _x = next._x;
                // @ts-ignore
                let _y = next._y;

                next.x = sw2 + (-cx) + _x;
                next.y = sh2 + (-cy) + _y;
                next.x *= scale;
                next.y *= scale;
                next.scale.x = scale;
                next.scale.y = scale;
            }
        }
    }

    draw(): void {

        this.removeChildren();

        let outerRange = 1024;

        let minX = -outerRange * 4;
        let minY = -outerRange * 4;
        let maxX = 32768 / this._scale;
        let maxY = 32768 / this._scale;
        let dx = maxX - minX;
        let dy = maxY - minY;

        let random = this.background.random;

        let atlas = this.background.project.atlas;

        let bgs: PIXI.Texture[] = [];
        let stars: PIXI.Texture[] = [];

        let textures = atlas.getTextureAtlases();
        for (let key in textures) {
            if (key.toLowerCase().startsWith('bg')) {
                bgs.push(textures[key].texture);
            } else if (key.toLowerCase().startsWith('star')) {
                stars.push(textures[key].texture);
            }
        }

        for (let index = 0; index < 256; index++) {

            let textureId = Math.floor(random.nextDouble() * stars.length);
            let texture = stars[textureId];
            if (texture == null || !texture.valid) {
                continue;
            }


            let sprite = new PIXI.Sprite(texture);
            sprite.filters = [MapRenderer.chromaFilter];
            sprite.filterArea = this.background.view.app.screen;
            sprite.x = Math.floor(minX + (random.nextDouble() * dx));
            sprite.y = Math.floor(minY + (random.nextDouble() * dy));

            // @ts-ignore
            sprite._x = sprite.x;
            // @ts-ignore
            sprite._y = sprite.y;

            this.addChild(sprite);
        }

        for (let index = 0; index < 32; index++) {

            let textureId = Math.floor(random.nextDouble() * bgs.length);
            let texture = bgs[textureId];
            if (texture == null || !texture.valid) {
                continue;
            }

            let sprite = new PIXI.Sprite(texture);
            sprite.filters = [MapRenderer.chromaFilter];
            sprite.filterArea = this.background.view.app.screen;
            sprite.x = Math.floor(minX + (random.nextDouble() * dx));
            sprite.y = Math.floor(minY + (random.nextDouble() * dy));

            // @ts-ignore
            sprite._x = sprite.x;
            // @ts-ignore
            sprite._y = sprite.y;

            this.addChild(sprite);
        }
    }
}

/**
 * The <i>StarFieldLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class StarFieldLayer extends PIXI.Container {

    _color: number;
    _scale: number;

    private background: Background;
    private points: number[][];

    constructor(background: Background, color: number, scale: number) {

        super();

        this.background = background;
        this._color = color;
        this._scale = scale;

        this.filters = [MapRenderer.chromaFilter];
        this.filterArea = this.background.view.app.screen;

        this.plot();

        this.draw();
    }

    private plot() {
        this.points = [];
        let outerRange = 1024;

        let minX = -outerRange * 4;
        let minY = -outerRange * 4;
        let maxX = 32768 / this._scale;
        let maxY = 32768 / this._scale;
        let dx = maxX - minX;
        let dy = maxY - minY;

        for (let index = 0; index < 32768; index++) {
            let x = Math.floor(minX + (Math.random() * dx));
            let y = Math.floor(minY + (Math.random() * dy));
            this.points.push([x, y]);
        }
    }

    draw(): void {

        this.removeChildren();

        let outerRange = 1024;

        let g = new PIXI.Graphics();

        g.beginFill(this._color);
        for (let index = 0; index < this.points.length; index++) {
            let next = this.points[index];
            g.drawRect(next[0], next[1], 1, 1);
        }
        g.endFill();

        this.addChild(g);
    }
}

// BackgroundObjectLayer.backgroundTextures = [];
//
// for (let index = 1; index <= 14; index++) {
//     let ext = index < 10 ? "0" + index : "" + index;
//     let path = "assets/media/bg" + ext + ".png";
//     BackgroundObjectLayer.backgroundTextures[index] = PIXI.Texture.from(path);
// }
//
// BackgroundObjectLayer.starTextures = [];
//
// for (let index = 1; index <= 7; index++) {
//     let ext = index < 10 ? "0" + index : "" + index;
//     let path = "assets/media/star" + ext + ".png";
//     BackgroundObjectLayer.starTextures[index] = PIXI.Texture.from(path);
// }
