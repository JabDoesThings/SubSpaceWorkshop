import { MapRenderer } from './MapRenderer';
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;
import { MapSprite } from './MapSprite';
import { Session } from '../Session';
import { ItemSelector, SpriteItem } from '../ui/ItemSelector';

export class TilesetPanel {

    private view: MapRenderer;
    private canvas: HTMLCanvasElement;

    primary: number;
    secondary: number;
    private primaryBox: HTMLElement;
    private secondaryBox: HTMLElement;

    private readonly coordinates: number[][];
    private readonly atlas: number[][];

    private specialTilesSection: HTMLElement;

    private lastSession: Session;
    private specialSprites: TileSpriteBag;

    private specialTileSelecter: ItemSelector;

    constructor(view: MapRenderer) {

        this.view = view;

        let container = <HTMLElement> document.getElementById('standard-tileset');
        let $container = $(container);

        this.canvas = <HTMLCanvasElement> $container.find('.tileset').get(0);
        this.primaryBox = $container.find('.tile-selector.primary').get(0);
        this.secondaryBox = $container.find('.tile-selector.secondary').get(0);

        this.coordinates = [];
        this.coordinates.push([-32, -32]);
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 19; x++) {
                this.coordinates.push([x * 16, y * 16]);
            }
        }

        let offset = 1;
        this.atlas = [];
        for (let y = 0; y < 10; y++) {
            this.atlas[y] = [];
            for (let x = 0; x < 19; x++) {
                this.atlas[y].push(offset++);
            }
        }

        let down = false;
        let downButton = -99999;

        let update = (button: number, mx: number, my: number): void => {

            let tx = (mx - (mx % 16)) / 16;
            let ty = (my - (my % 16)) / 16;

            console.log('mx=' + mx + ', my=' + my + ', tx=' + tx + ', ty=' + ty);
            if (tx >= 0 && tx < 19 && ty >= 0 && ty < 10) {
                let tileId = this.atlas[ty][tx];

                if (button == 0) {
                    this.setPrimary(tileId);
                } else if (button == 2) {
                    this.setSecondary(tileId);
                }
            }
        };

        $(this.canvas).on('mousedown', (e: MouseDownEvent) => {
            down = true;

            let button = e.button;
            downButton = button;
            let mx = e.offsetX;
            let my = e.offsetY;

            update(button, mx, my);
        });

        $(document).on('mouseup', () => {
            down = false;
            downButton = -99999;
        });

        $(this.canvas).on('mousemove', (e: MouseMoveEvent) => {

            if (down) {

                let button = e.button;
                let mx = e.offsetX;
                let my = e.offsetY;

                if (downButton !== -99999) {
                    button = downButton;
                }

                update(button, mx, my);
            }
        });

        this.setPrimary(1);
        this.setSecondary(2);

        this.specialTilesSection = document.getElementById('special-tiles-section');

        this.specialTileSelecter = new ItemSelector(this.specialTilesSection);
        this.specialTileSelecter.init();
        this.specialTileSelecter.app.view.width = container.clientWidth;
    }

    setPrimary(id: number): void {

        if (this.primary !== id) {

            this.primary = id;

            if (this.primary <= 190) {
                let coords = this.coordinates[this.primary];
                this.primaryBox.style.top = coords[1] + "px";
                this.primaryBox.style.left = coords[0] + "px";
            }
        }

    }

    setSecondary(id: number): void {

        if (this.secondary !== id) {

            this.secondary = id;

            if (this.secondary <= 190) {
                let coords = this.coordinates[this.secondary];
                this.secondaryBox.style.top = coords[1] + "px";
                this.secondaryBox.style.left = coords[0] + "px";
            }
        }
    }

    update(): void {

        let session = this.view.session;

        if (session !== this.lastSession) {
            this.createTileSprites(session);
            this.lastSession = session;
        }

        if (session == null) {
            return;
        }

        let map = session.map;
        if (map == null) {
            return;
        }

        let tileset = map.tileset;
        if (tileset != null && tileset.isDirty()) {
            this.draw();
        }
    }

    createTileSprites(session: Session): void {

        this.specialTileSelecter.clear();

        let add = (id: string, sprite: MapSprite): void => {
            let item = new SpriteItem(this.specialTileSelecter, id, sprite);
            this.specialTileSelecter.add(item);
        };

        let lvlSprites = session.cache.lvlSprites;
        add('216', lvlSprites.mapSpriteOver1);
        add('217', lvlSprites.mapSpriteOver2);
        add('218', lvlSprites.mapSpriteOver3);
        add('219', lvlSprites.mapSpriteOver4);
        add('220', lvlSprites.mapSpriteOver5);
        add('252', lvlSprites.mapSpriteBrickBlue);
        add('253', lvlSprites.mapSpriteBrickYellow);
        add('255', lvlSprites.mapSpritePrize);

        // this.specialSprites.clear();
        // if (session == null) {
        //     return;
        // }
        //
        // let add = (id: string, sprite: MapSprite) => {
        //     let tileSpriteContainer = document.getElementById(id);
        //     let canvas = <HTMLCanvasElement> tileSpriteContainer.getElementsByTagName('canvas').item(0);
        //     this.specialSprites.add(id, new TileSprite(canvas, sprite));
        // };
        //
        // let lvlSprites = session.cache.lvlSprites;
        //
        // add('over1', lvlSprites.mapSpriteOver1);
        // add('over2', lvlSprites.mapSpriteOver2);
        // add('over3', lvlSprites.mapSpriteOver3);
        // add('over4', lvlSprites.mapSpriteOver4);
        // add('over5', lvlSprites.mapSpriteOver5);
    }

    draw(): void {
        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 304, 160);

        let session = this.view.session;
        if (session == null) {
            return;
        }
        let map = session.map;
        if (map == null) {
            return;
        }

        let tileset = map.tileset;
        if (tileset != null) {
            ctx.drawImage(tileset.source, 0, 0);
        }
    }
}

export class TileSpriteBag {

    sprites: { [id: string]: TileSprite };
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.sprites = {};
    }

    private sort() {

        let array: TileSprite[] = [];

        for (let key in this.sprites) {
            array.push(this.sprites[key]);
        }

        array.sort((a, b) => {
            return (a.sprite.frameWidth * a.sprite.frameHeight) - (b.sprite.frameWidth * b.sprite.frameHeight);
        });

        let offset = {x: 0, y: 0};

        for (let index = 0; index < array.length; index++) {
            let next = array[index];
        }

    }

    update(): void {
        for (let key in this.sprites) {
            let value = this.sprites[key];
            value.update();
        }
    }

    add(id: string, sprite: TileSprite) {
        this.sprites[id] = sprite;
        this.sort();
    }

    clear() {
        this.sprites = {};
    }
}

export class TileSprite {

    canvas: HTMLCanvasElement;
    sprite: MapSprite;

    lastOffset: number;

    constructor(canvas: HTMLCanvasElement = null, sprite: MapSprite) {

        // if (canvas == null) {
        //     canvas = document.createElement('canvas');
        //     canvas.width = sprite.frameWidth;
        //     canvas.height = sprite.frameHeight;
        // }

        this.canvas = canvas;
        this.sprite = sprite;
        this.lastOffset = -1;
    }

    update(): void {

        if (this.lastOffset !== this.sprite.frameOffset) {
            this.draw();
            this.lastOffset = this.sprite.frameOffset;
        }
    }

    draw(): void {

        let source = this.sprite.source;
        let current = this.sprite.current;
        let x = current[0];
        let y = current[1];
        let w = this.canvas.width = current[2];
        let h = this.canvas.height = current[3];

        let parent = this.canvas.parentElement;
        let pstyle = parent.style;
        pstyle.width = pstyle.minWidth = pstyle.maxWidth = w + 'px';
        pstyle.height = pstyle.minHeight = pstyle.maxHeight = h + 'px';

        let ctx = this.canvas.getContext('2d');

        // Clear the canvas, even if the sprite isn't available.
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, w, h);

        if (this.sprite.source == null) {
            return;
        }

        ctx.drawImage(source, x, y, w, h, 0, 0, w, h);
    }
}
