import * as PIXI from "pixi.js";
import { Renderer } from './Renderer';

export class Background extends PIXI.Container {

    view: Renderer;
    private layer1: StarFieldLayer;
    private layer2: StarFieldLayer;
    private texLayer: BackgroundObjectLayer;

    g: PIXI.Graphics;

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

        this.addChild(this.g);
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

        if (camera.isDirty()) {

            let cPos = camera.getPosition();
            let cx = cPos.x * 16;
            let cy = cPos.y * 16;

            let next = this.layer1;
            next.x = Math.floor(-(cx / next._scale));
            next.y = Math.floor(-(cy / next._scale));

            next = this.layer2;
            next.x = Math.floor(-(cx / next._scale));
            next.y = Math.floor(-(cy / next._scale));

            let next2 = this.texLayer;
            next2.x = Math.floor(-(cx / 2));
            next2.y = Math.floor(-(cy / 2));
        }
    }
}

export class BackgroundObjectLayer extends PIXI.Container {

    static backgroundTextures: PIXI.Texture[];
    static starTextures: PIXI.Texture[];

    private background: Background;

    constructor(background: Background) {

        super();

        this.background = background;
        this.draw();

        this.filters = [Renderer.chromaFilter];
        this.filterArea = this.background.view.app.screen;
    }

    draw(): void {

        this.removeChildren();

        let outerRange = 1024;

        let minX = -outerRange;
        let minY = -outerRange;
        let maxX = 16384 + outerRange;
        let maxY = 16384 + outerRange;
        let dx = maxX - minX;
        let dy = maxY - minY;

        for (let index = 0; index < 256; index++) {

            let tex = Math.floor(Math.random() * BackgroundObjectLayer.starTextures.length);

            let sprite = new PIXI.Sprite(BackgroundObjectLayer.starTextures[tex]);
            sprite.filters = [Renderer.chromaFilter];
            sprite.filterArea = this.background.view.app.screen;
            sprite.x = Math.floor(minX + (Math.random() * dx));
            sprite.y = Math.floor(minY + (Math.random() * dy));

            this.addChild(sprite);
        }

        for (let index = 0; index < 32; index++) {

            let tex = Math.floor(Math.random() * BackgroundObjectLayer.backgroundTextures.length);

            let sprite = new PIXI.Sprite(BackgroundObjectLayer.backgroundTextures[tex]);
            sprite.filters = [Renderer.chromaFilter];
            sprite.filterArea = this.background.view.app.screen;
            sprite.x = Math.floor(minX + (Math.random() * dx));
            sprite.y = Math.floor(minY + (Math.random() * dy));

            this.addChild(sprite);
        }
    }
}

export class StarFieldLayer extends PIXI.Container {

    _color: number;
    _scale: number;

    private background: Background;

    constructor(background: Background, color: number, scale: number) {

        super();

        this.background = background;
        this._color = color;
        this._scale = scale;

        this.filters = [Renderer.chromaFilter];
        this.filterArea = this.background.view.app.screen;

        this.draw();
    }

    draw(): void {

        this.removeChildren();

        let outerRange = 1024;

        let minX = -outerRange;
        let minY = -outerRange;
        let maxX = 16384 + outerRange;
        let maxY = 16384 + outerRange;
        let dx = maxX - minX;
        let dy = maxY - minY;

        let g = new PIXI.Graphics();

        for (let index = 0; index < 32768; index++) {

            let x = Math.floor(minX + (Math.random() * dx));
            let y = Math.floor(minY + (Math.random() * dy));

            g.beginFill(this._color);
            g.drawRect(x, y, 1, 1);
            g.endFill();
        }

        this.addChild(g);
    }

}

BackgroundObjectLayer.backgroundTextures = [];

for (let index = 1; index <= 14; index++) {
    let ext = index < 10 ? "0" + index : "" + index;
    let path = "assets/media/bg" + ext + ".bm2";
    console.log("Loading " + path + "...");
    BackgroundObjectLayer.backgroundTextures[index] = PIXI.Texture.from(path);
}

BackgroundObjectLayer.starTextures = [];

for (let index = 1; index <= 7; index++) {
    let ext = index < 10 ? "0" + index : "" + index;
    let path = "assets/media/star" + ext + ".bm2";
    console.log("Loading " + path + "...");
    BackgroundObjectLayer.starTextures[index] = PIXI.Texture.from(path);
}
