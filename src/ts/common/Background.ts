import * as PIXI from "pixi.js";
import { MapRenderer } from '../simple/render/MapRenderer';
import { Renderer } from './Renderer';

export class Background extends PIXI.Container {

    view: Renderer;
    g: PIXI.Graphics;

    private layer1: StarFieldLayer;
    private layer2: StarFieldLayer;
    private texLayer: BackgroundObjectLayer;
    private lw: number;
    private lh: number;

    constructor(view: Renderer) {

        super();

        this.view = view;

        this.filters = [];
        this.filterArea = view.app.screen;

        this.g = new PIXI.Graphics();
        this.lw = -1;
        this.lh = -1;

        this.draw();
    }

    draw(): void {
        this.removeChildren();

        this.layer1 = new StarFieldLayer(this, 0x606060, 8);
        this.layer2 = new StarFieldLayer(this, 0xB8B8B8, 6);
        this.texLayer = new BackgroundObjectLayer(this);

        // this.addChild(this.g);
        this.addChild(this.layer1);
        this.addChild(this.layer2);
        this.addChild(this.texLayer);
    }

    update(): void {

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
            alpha = (scale - 0.25) * 2;
            if (alpha > 1) {
                alpha = 1;
            } else if (alpha < 0) {
                alpha = 0;
            }
            this.alpha = alpha;
        }

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
    }
}

export class BackgroundObjectLayer extends PIXI.Container {

    static backgroundTextures: PIXI.Texture[];
    static starTextures: PIXI.Texture[];

    private background: Background;

    _scale: number;

    constructor(background: Background) {

        super();

        this._scale = 2;

        this.background = background;
        this.draw();

        this.filters = [MapRenderer.chromaFilter];
        this.filterArea = this.background.view.app.screen;
    }

    update(): void {
        let camera = this.background.view.camera;
        // if (camera.isDirty()) {

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
        // }
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

        for (let index = 0; index < 256; index++) {

            let tex = Math.floor(Math.random() * BackgroundObjectLayer.starTextures.length);

            let sprite = new PIXI.Sprite(BackgroundObjectLayer.starTextures[tex]);
            sprite.filters = [MapRenderer.chromaFilter];
            sprite.filterArea = this.background.view.app.screen;
            sprite.x = Math.floor(minX + (Math.random() * dx));
            sprite.y = Math.floor(minY + (Math.random() * dy));

            // @ts-ignore
            sprite._x = sprite.x;
            // @ts-ignore
            sprite._y = sprite.y;

            this.addChild(sprite);
        }

        for (let index = 0; index < 32; index++) {

            let tex = Math.floor(Math.random() * BackgroundObjectLayer.backgroundTextures.length);

            let sprite = new PIXI.Sprite(BackgroundObjectLayer.backgroundTextures[tex]);
            sprite.filters = [MapRenderer.chromaFilter];
            sprite.filterArea = this.background.view.app.screen;
            sprite.x = Math.floor(minX + (Math.random() * dx));
            sprite.y = Math.floor(minY + (Math.random() * dy));

            // @ts-ignore
            sprite._x = sprite.x;
            // @ts-ignore
            sprite._y = sprite.y;

            this.addChild(sprite);
        }
    }
}

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

BackgroundObjectLayer.backgroundTextures = [];

for (let index = 1; index <= 14; index++) {
    let ext = index < 10 ? "0" + index : "" + index;
    let path = "assets/media/bg" + ext + ".bm2";
    BackgroundObjectLayer.backgroundTextures[index] = PIXI.Texture.from(path);
}

BackgroundObjectLayer.starTextures = [];

for (let index = 1; index <= 7; index++) {
    let ext = index < 10 ? "0" + index : "" + index;
    let path = "assets/media/star" + ext + ".bm2";
    BackgroundObjectLayer.starTextures[index] = PIXI.Texture.from(path);
}
