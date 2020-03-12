import { MapRenderer } from '../render/MapRenderer';
import { MapSprite } from '../render/MapSprite';
import { Session } from '../Session';
import { ItemSelector, ItemSelectorAction, ItemSelectorEvent, SpriteItem } from './ItemSelector';
import { Selection, SelectionSlot, SelectionType } from './Selection';
import { UIPanelSection } from './UI';
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;

/**
 * The <i>AssetPanel</i> class. TODO: Document.
 *
 * @author Jab
 */
export class AssetPanel {

    view: MapRenderer;

    tileSelector: TileSection;
    specialTileSelector: ItemSelector;
    mapImageSelector: ItemSelector;

    private lastSession: Session;
    private contentFrameResize: boolean = false;
    private specialTilesSection: UIPanelSection;
    private mapImagesSection: UIPanelSection;

    constructor(view: MapRenderer) {

        this.view = view;

        let palettePanel = view.rightPanel.getPanel('palette');
        this.specialTilesSection = palettePanel.getSection('special-tiles');
        this.mapImagesSection = palettePanel.getSection('map-images');
        let width = palettePanel.panel.width - 14;

        this.tileSelector = new TileSection(this);

        this.specialTileSelector = new ItemSelector(this, this.specialTilesSection.content.contents);
        this.specialTileSelector.init(width);
        this.specialTileSelector.addEventListener((event: ItemSelectorEvent) => {
            if (event.action === ItemSelectorAction.POST_DRAW && this.specialTilesSection.isOpen()) {
                this.specialTilesSection.open();
            }
        });

        this.mapImageSelector = new ItemSelector(this, this.mapImagesSection.content.contents);
        this.mapImageSelector.init(width);
        this.mapImageSelector.addEventListener((event: ItemSelectorEvent) => {
            if (event.action === ItemSelectorAction.POST_DRAW && this.mapImagesSection.isOpen()) {
                this.mapImagesSection.open();
            }
        });

        this.mapImageSelector.addEventListener((event: ItemSelectorEvent) => {
            console.log(event);
        });
    }

    update(): void {

        let session = this.view.session;

        let spriteDirty = session !== this.lastSession;
        if (!spriteDirty) {
            for (let key in this.mapImageSelector.items) {
                if (this.mapImageSelector.items[key].isDirty()) {
                    spriteDirty = true;
                    break;
                }
            }
        }

        if (spriteDirty) {

            this.createTileSprites(session);
            this.tileSelector.draw();
            this.specialTileSelector.draw();

            this.createLVZAssets(session);
            this.mapImageSelector.draw();
            this.mapImagesSection.open();

            for (let key in this.mapImageSelector.items) {
                this.mapImageSelector.items[key].setDirty(false);
            }

            if (!this.contentFrameResize) {
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

        this.tileSelector.update();

        this.lastSession = session;
    }

    createTileSprites(session: Session): void {
        this.specialTileSelector.clear();
        let add = (id: string, sprite: MapSprite, selector: ItemSelector): void => {
            let item = new SpriteItem(selector, SelectionType.TILE, id, sprite);
            selector.add(item);
        };
        let lvlSprites = session.cache.lvlSprites;
        add('216', lvlSprites.mapSpriteOver1, this.specialTileSelector);
        add('217', lvlSprites.mapSpriteOver2, this.specialTileSelector);
        add('218', lvlSprites.mapSpriteOver3, this.specialTileSelector);
        add('219', lvlSprites.mapSpriteOver4, this.specialTileSelector);
        add('220', lvlSprites.mapSpriteOver5, this.specialTileSelector);
        add('252', lvlSprites.mapSpriteBrickBlue, this.specialTileSelector);
        add('253', lvlSprites.mapSpriteBrickYellow, this.specialTileSelector);
        add('255', lvlSprites.mapSpritePrize, this.specialTileSelector);
    }

    createLVZAssets(session: Session): void {

        this.mapImageSelector.clear();

        let lvzPackages = session.lvzPackages;

        if (lvzPackages == null || lvzPackages.length == 0) {
            return;
        }

        let add = (id: string, sprite: MapSprite, selector: ItemSelector): void => {
            let item = new SpriteItem(selector, SelectionType.IMAGE, id, sprite);
            selector.add(item);
            let callbacks = session.cache.callbacks[id];
            if (callbacks == null) {
                callbacks = session.cache.callbacks[id] = [];
            }
            callbacks.push(() => {
                this.mapImageSelector.setDirty(true);
            });
        };

        for (let key in lvzPackages) {

            let pkg = lvzPackages[key];

            if (pkg.images.length === 0) {
                continue;
            }

            for (let index = 0; index < pkg.images.length; index++) {
                let id = pkg.name + ">>>" + index;
                let sprite: MapSprite = session.cache.lvzSprites.getSpriteById(id);
                if (sprite == null) {
                    continue;
                }
                add(id, sprite, this.mapImageSelector);
            }
        }
    }

    draw() {
        this.tileSelector.draw();
        this.specialTileSelector.draw();
        this.mapImageSelector.draw();
    }
}

/**
 * The <i>TileSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TileSection {

    private readonly canvas: HTMLCanvasElement;
    private readonly atlas: number[][];
    private readonly coordinates: number[][];
    private panel: AssetPanel;

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
