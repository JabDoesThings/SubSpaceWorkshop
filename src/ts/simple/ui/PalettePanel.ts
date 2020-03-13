import { MapRenderer } from '../render/MapRenderer';
import { MapSprite } from '../render/MapSprite';
import { Session } from '../Session';
import { ItemSelector, ItemSelectorAction, ItemSelectorEvent, SpriteItem } from './ItemSelector';
import { Selection, SelectionSlot, SelectionType } from './Selection';
import { UIPanelSection, UIPanelTab } from './UI';
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;

/**
 * The <i>PalettePanel</i> class. TODO: Document.
 *
 * @author Jab
 */
export class PalettePanel extends UIPanelTab {

    renderer: MapRenderer;

    selectorStandardTile: TileSection;
    selectorSpecialTile: ItemSelector;
    selectorMapImage: ItemSelector;

    private lastSession: Session;
    private contentFrameResize: boolean = false;

    private sectionStandardTile: UIPanelSection;
    private sectionSpecialTile: UIPanelSection;
    private sectionMapImage: UIPanelSection;

    /**
     * Main constructor.
     *
     * @param renderer
     */
    constructor(renderer: MapRenderer) {

        super('palette');

        this.renderer = renderer;

        let width = 306;
        this.sectionStandardTile = this.createSection('standard-tiles', 'Standard Tiles');
        this.sectionSpecialTile = this.createSection('special-tiles', 'Special Tiles');
        this.sectionMapImage = this.createSection('map-images', 'Map Images');

        let standardTileDiv = document.createElement('div');
        standardTileDiv.id = 'standard-tileset';
        standardTileDiv.classList.add('standard-tileset');
        this.sectionStandardTile.setContents([standardTileDiv]);
        this.selectorStandardTile = new TileSection(this);

        this.selectorSpecialTile = new ItemSelector(this, this.sectionSpecialTile.content.contents);
        this.selectorSpecialTile.init(width);
        this.selectorSpecialTile.addEventListener((event: ItemSelectorEvent) => {
            if (event.action === ItemSelectorAction.POST_DRAW && this.sectionSpecialTile.isOpen()) {
                this.sectionSpecialTile.open();
            }
        });

        this.selectorMapImage = new ItemSelector(this, this.sectionMapImage.content.contents);
        this.selectorMapImage.init(width);
        this.selectorMapImage.addEventListener((event: ItemSelectorEvent) => {
            if (event.action === ItemSelectorAction.POST_DRAW && this.sectionMapImage.isOpen()) {
                this.sectionMapImage.open();
            }
        });
    }

    update(): void {

        let session = this.renderer.session;

        let spriteDirty = session !== this.lastSession;
        if (!spriteDirty) {
            for (let key in this.selectorMapImage.items) {
                if (this.selectorMapImage.items[key].isDirty()) {
                    spriteDirty = true;
                    break;
                }
            }
        }

        if (spriteDirty) {

            this.createTileSprites(session);
            this.selectorStandardTile.draw();
            this.selectorSpecialTile.draw();

            this.createLVZAssets(session);
            this.selectorMapImage.draw();
            this.sectionMapImage.open();

            for (let key in this.selectorMapImage.items) {
                this.selectorMapImage.items[key].setDirty(false);
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

        this.selectorStandardTile.update();

        this.lastSession = session;
    }

    createTileSprites(session: Session): void {
        this.selectorSpecialTile.clear();
        let add = (id: string, sprite: MapSprite, selector: ItemSelector): void => {
            let item = new SpriteItem(selector, SelectionType.TILE, id, sprite);
            selector.add(item);
        };
        let lvlSprites = session.cache.lvlSprites;
        add('216', lvlSprites.mapSpriteOver1, this.selectorSpecialTile);
        add('217', lvlSprites.mapSpriteOver2, this.selectorSpecialTile);
        add('218', lvlSprites.mapSpriteOver3, this.selectorSpecialTile);
        add('219', lvlSprites.mapSpriteOver4, this.selectorSpecialTile);
        add('220', lvlSprites.mapSpriteOver5, this.selectorSpecialTile);
        add('252', lvlSprites.mapSpriteBrickBlue, this.selectorSpecialTile);
        add('253', lvlSprites.mapSpriteBrickYellow, this.selectorSpecialTile);
        add('255', lvlSprites.mapSpritePrize, this.selectorSpecialTile);
    }

    createLVZAssets(session: Session): void {

        this.selectorMapImage.clear();

        let packages = session.lvzManager.packages;
        if (packages == null || packages.length == 0) {
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
                this.selectorMapImage.setDirty(true);
            });
        };

        for (let key in packages) {

            let pkg = packages[key];

            if (pkg.images.length === 0) {
                continue;
            }

            for (let index = 0; index < pkg.images.length; index++) {
                let id = pkg.name + ">>>" + index;
                let sprite: MapSprite = session.cache.lvzSprites.getSpriteById(id);
                if (sprite == null) {
                    continue;
                }
                add(id, sprite, this.selectorMapImage);
            }
        }
    }

    draw(): void {
        this.selectorStandardTile.draw();
        this.selectorSpecialTile.draw();
        this.selectorMapImage.draw();
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
    private panel: PalettePanel;

    /**
     * Main constructor.
     *
     * @param panel
     */
    constructor(panel: PalettePanel) {

        this.panel = panel;

        this.canvas = <HTMLCanvasElement> document.createElement('canvas');
        this.canvas.width = 304;
        this.canvas.height = 160;

        panel.getSection('standard-tiles').setContents([this.canvas]);

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
                this.panel.renderer.session.selectionGroup.setSelection(slot, selection);
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

        let session = this.panel.renderer.session;

        if (session == null) {
            return;
        }

        let map = session.map;
        if (map == null) {
            return;
        }

        let tileset = map.tileset;
        if ((tileset != null && tileset.isDirty())
            || (this.panel.renderer.session != null && this.panel.renderer.session.selectionGroup.isDirty())) {
            this.draw();
        }
    }

    draw(): void {

        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 304, 160);

        let session = this.panel.renderer.session;
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

        let selectionGroup = this.panel.renderer.session.selectionGroup;
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
