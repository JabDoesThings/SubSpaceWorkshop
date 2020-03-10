import { MapRenderer } from '../render/MapRenderer';
import { MapSprite } from '../render/MapSprite';
import { Session } from '../Session';
import { ItemSelector, SpriteItem } from './ItemSelector';
import { SelectionSlot, SelectionType, Selection } from './Selection';
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;

export class AssetPanel {

    view: MapRenderer;
    tileSection: TileSection;
    specialTileSection: ItemSelector;

    private lastSession: Session;
    private mapImageSection: ItemSelector;
    private contentFrameResize: boolean = false;

    constructor(view: MapRenderer) {

        this.view = view;

        this.tileSection = new TileSection(this);

        let specialTilesSection = document.getElementById('special-tiles-section');
        this.specialTileSection = new ItemSelector(this, specialTilesSection);
        this.specialTileSection.init(specialTilesSection.clientWidth - 14);

        let mapImageSection = document.getElementById('map-image-section');
        this.mapImageSection = new ItemSelector(this, mapImageSection);
        this.mapImageSection.init(mapImageSection.clientWidth - 14);
    }

    update(): void {

        let session = this.view.session;

        let spriteDirty = session !== this.lastSession;
        if (!spriteDirty) {
            for (let key in this.mapImageSection.items) {
                if (this.mapImageSection.items[key].isDirty()) {
                    spriteDirty = true;
                    break;
                }
            }
        }

        if (spriteDirty) {

            this.tileSection.draw();

            this.createTileSprites(session);
            this.tileSection.draw();
            this.createLVZAssets(session);
            this.mapImageSection.draw();

            for (let key in this.mapImageSection.items) {
                this.mapImageSection.items[key].setDirty(false);
            }

            if(!this.contentFrameResize) {
                this.contentFrameResize = true;
                setTimeout(() => {
                    $(document.body).find('.side-panel.right .content-frame').each(function () {
                        if (this.parentElement != null && this.parentElement.classList.contains('open')) {
                            this.style.maxHeight = (this.scrollHeight) + "px";
                        } else {
                            this.style.maxHeight = null;
                        }
                    });
                    this.contentFrameResize = false;
                }, 20);
            }
        }

        this.tileSection.update();

        this.lastSession = session;
    }

    createTileSprites(session: Session): void {
        this.specialTileSection.clear();
        let add = (id: string, sprite: MapSprite, selector: ItemSelector): void => {
            let item = new SpriteItem(selector, SelectionType.TILE, id, sprite);
            selector.add(item);
        };
        let lvlSprites = session.cache.lvlSprites;
        add('216', lvlSprites.mapSpriteOver1, this.specialTileSection);
        add('217', lvlSprites.mapSpriteOver2, this.specialTileSection);
        add('218', lvlSprites.mapSpriteOver3, this.specialTileSection);
        add('219', lvlSprites.mapSpriteOver4, this.specialTileSection);
        add('220', lvlSprites.mapSpriteOver5, this.specialTileSection);
        add('252', lvlSprites.mapSpriteBrickBlue, this.specialTileSection);
        add('253', lvlSprites.mapSpriteBrickYellow, this.specialTileSection);
        add('255', lvlSprites.mapSpritePrize, this.specialTileSection);
    }

    createLVZAssets(session: Session): void {
        this.mapImageSection.clear();
        let add = (id: string, sprite: MapSprite, selector: ItemSelector): void => {
            let item = new SpriteItem(selector, SelectionType.IMAGE, id, sprite);
            selector.add(item);
        };
        let lvzSprites = session.cache.lvzSprites;
        for (let index = 0; index < lvzSprites.size(); index++) {
            let next = lvzSprites.getSprite(index);
            add('' + index, next, this.mapImageSection);
        }
    }

    draw() {
        this.tileSection.draw();
        this.specialTileSection.draw();
        this.mapImageSection.draw();
    }
}

export class TileSection {

    private canvas: HTMLCanvasElement;
    private panel: AssetPanel;
    private atlas: number[][];
    private coordinates: number[][];

    constructor(panel: AssetPanel) {

        this.panel = panel;

        this.canvas = <HTMLCanvasElement> document.createElement('canvas');
        this.canvas.width = 304;
        this.canvas.height = 160;

        let container = <HTMLElement> document.getElementById('standard-tileset');
        container.appendChild(this.canvas);

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

            if (tx >= 0 && tx < 19 && ty >= 0 && ty < 10) {
                let selection = new Selection(SelectionType.TILE, this.atlas[ty][tx]);
                let slot: SelectionSlot;
                if (button == 0) {
                    slot = SelectionSlot.PRIMARY;
                } else if (button == 2) {
                    slot = SelectionSlot.SECONDARY;
                }
                this.panel.view.session.selectionGroup.setSelection(slot, selection);
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
    }

    update(): void {

        let session = this.panel.view.session;

        if (session == null) {
            return;
        }

        let map = session.map;
        if (map == null) {
            return;
        }

        let tileset = map.tileset;
        if ((tileset != null && tileset.isDirty())
            || (this.panel.view.session != null && this.panel.view.session.selectionGroup.isDirty())) {
            this.draw();
        }
    }

    draw(): void {

        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 304, 160);

        let session = this.panel.view.session;
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

        let selectionGroup = this.panel.view.session.selectionGroup;
        let primary = selectionGroup.getSelection(SelectionSlot.PRIMARY);
        let secondary = selectionGroup.getSelection(SelectionSlot.SECONDARY);

        let draw = (tile: number, color: string) => {
            let coordinates = this.coordinates[tile];
            ctx.strokeStyle = ctx.fillStyle = color;
            ctx.imageSmoothingQuality = 'low';
            ctx.imageSmoothingEnabled = false;
            ctx.globalAlpha = 1;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(coordinates[0] + 0.5, coordinates[1] + 0.5, 15, 15);
            ctx.stroke();
        };

        let combinedColor = 'rgba(255, 255, 255, 1)';
        let primaryColor = 'rgba(255, 0, 0, 1)';
        let secondaryColor = 'rgba(255, 255, 0, 1)';

        if (primary.type == SelectionType.TILE && secondary.type == SelectionType.TILE) {
            if (primary.id == secondary.id && primary.id >= 1 && primary.id <= 190) {
                draw(<number> primary.id, combinedColor);
            } else {
                if (primary.type == SelectionType.TILE && primary.id >= 1 && primary.id <= 190) {
                    draw(<number> primary.id, primaryColor);
                }
                if (secondary.type == SelectionType.TILE && secondary.id >= 1 && secondary.id <= 190) {
                    draw(<number> secondary.id, secondaryColor);
                }
            }
        } else {
            if (primary.type == SelectionType.TILE && primary.id >= 1 && primary.id <= 190) {
                draw(<number> primary.id, primaryColor);
            }
            if (secondary.type == SelectionType.TILE && secondary.id >= 1 && secondary.id <= 190) {
                draw(<number> secondary.id, secondaryColor);
            }
        }
    }
}
