import * as PIXI from "pixi.js";
import { MapSprite } from '../render/MapSprite';
import { Dirtable } from '../../util/Dirtable';
import Rectangle = PIXI.Rectangle;
import { AssetPanel } from './AssetPanel';
import { SelectionSlot, Selection } from './Selection';

/**
 * The <i>ItemSelector</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ItemSelector implements Dirtable {

    items: { [id: string]: Item };

    app: PIXI.Application;
    private canvas: HTMLCanvasElement;
    private dirty: boolean;
    private readonly container: HTMLElement;

    maxWidthTiles: number;
    maxHeightTiles: number;
    minYSlots: number;
    maxYSlots: number;
    tileSize: number;
    listener: ItemSelectorListener;

    panel: AssetPanel;

    constructor(panel: AssetPanel, container: HTMLElement) {

        this.panel = panel;
        this.container = container;

        this.items = {};
        this.tileSize = 16;
        this.maxHeightTiles = 8;
        this.maxHeightTiles = 8;
        this.minYSlots = 6;
        this.maxYSlots = 32;
        this.dirty = true;
    }

    init(width: number): void {

        this.app = new PIXI.Application({
            width: width,
            height: this.tileSize,
            backgroundColor: 0x0,
            resolution: window.devicePixelRatio || 1,
            antialias: false,
            forceFXAA: false,
            clearBeforeRender: true
        });

        this.canvas = this.app.view;
        this.container.appendChild(this.canvas);

        this.app.ticker.add(() => {

            let dirty = this.dirty;
            if (!dirty) {
                for (let id in this.items) {
                    let next = this.items[id];
                    if (next.isDirty()) {
                        dirty = true;
                    }
                }
            }

            if (dirty) {
                this.draw();
                this.setDirty(false);
            }

            for (let id in this.items) {
                this.items[id].update();
            }
        });

        this.listener = new ItemSelectorListener(this);
        this.listener.init();
    }

    draw() {

        this.app.stage.removeChildren();

        let xSlots = Math.floor(Math.floor(this.canvas.width) / 16);
        let ySlots = this.minYSlots;

        let slots: boolean[][] = [];
        for (let x = 0; x < xSlots; x++) {
            slots[x] = [];
            for (let y = 0; y < ySlots; y++) {
                slots[x][y] = false;
            }
        }

        let addRow = (): boolean => {

            if (ySlots + 1 > this.maxYSlots) {
                return false;
            }

            for (let x = 0; x < xSlots; x++) {
                slots[x][ySlots] = false;
            }

            ySlots++;
            return true;
        };

        let attempt = (width: number, height: number): { x: number, y: number } => {

            for (let y = 0; y < ySlots; y++) {

                for (let x = 0; x < slots.length; x++) {

                    let room = true;

                    for (let j = 0; j < height; j++) {

                        for (let i = 0; i < width; i++) {

                            if (slots[x][y]) {
                                room = false;
                                break;
                            }
                        }

                        if (!room) {
                            break;
                        }
                    }

                    if (room) {
                        return {x: x, y: y};
                    }
                }
            }
            return null;
        };

        let getSpot = (item: Item): { x: number, y: number } => {

            let width = item.getSourceWidth();
            let height = item.getSourceHeight();

            if (width == 0 || height == 0) {
                return null;
            }

            let widthTiles = Math.ceil(width / this.tileSize);
            let heightTiles = Math.ceil(height / this.tileSize);

            if (widthTiles > this.maxWidthTiles) {
                widthTiles = this.maxWidthTiles;
                item.w = widthTiles * this.tileSize;
            } else {
                item.w = item.getSourceWidth();
            }

            if (heightTiles > this.maxHeightTiles) {
                heightTiles = this.maxHeightTiles;
                item.h = heightTiles * this.tileSize;
            } else {
                item.h = item.getSourceHeight();
            }

            item.wt = widthTiles;
            item.ht = heightTiles;

            // Make sure the slots can fit the image first before finding a spot.
            while (ySlots < item.ht) {
                if (!addRow()) {
                    return null;
                }
            }

            let coords = null;
            while (coords == null) {
                coords = attempt(widthTiles, heightTiles);
                if (coords == null && !addRow()) {
                    break;
                }
            }

            if (coords != null) {
                return {x: coords.x, y: coords.y};
            } else {
                return null;
            }
        };

        let sorted = [];
        for (let key in this.items) {
            sorted.push(this.items[key]);
        }

        sorted.sort(((a, b) => {
            return (b.getSourceWidth() * b.getSourceHeight()) - (a.getSourceWidth() * a.getSourceHeight());
        }));

        for (let index = 0; index < sorted.length; index++) {

            let next = sorted[index];

            let spot = getSpot(next);
            if (spot == null) {
                next.getContainer().visible = false;
                continue;
            }

            next.getContainer().visible = true;
            next.x = spot.x * this.tileSize;
            next.y = spot.y * this.tileSize;
            next.setDirty(true);

            this.app.stage.addChild(next.getContainer());
            this.app.stage.addChild(next.outline);

            let x1 = spot.x;
            let y1 = spot.y;
            let x2 = x1 + next.wt;
            let y2 = y1 + next.ht;

            for (let y = y1; y < y2; y++) {
                for (let x = x1; x < x2; x++) {
                    slots[x][y] = true;
                }
            }
        }

        this.app.view.height = ySlots * this.tileSize;
        this.app.screen.height = this.app.view.height;
    }

    add(entry: Item): void {

        if (entry == null) {
            throw new Error("The Entry given is null or undefined.");
        }

        this.items[entry.id] = entry;
        this.setDirty(true);
    }

    remove(entry: string | Item): void {

        if (entry == null) {
            throw new Error("The Entry given is null or undefined.");
        }

        if (typeof entry === 'string') {
            this.items[entry] = undefined;
        } else {
            this.items[entry.id] = undefined;
        }

        this.setDirty(true);
    }

    clear(): void {
        this.items = {};
        this.setDirty(true);
    }

    selectPrimary(item: Item): void {

        let selectionGroup = this.panel.view.session.selectionGroup;
        let primary = selectionGroup.getSelection(SelectionSlot.PRIMARY);

        if (item.type === primary.type && item.id === primary.id) {
            return;
        }

        let selection = new Selection(item.type, item.id);
        this.panel.view.session.selectionGroup.setSelection(SelectionSlot.PRIMARY, selection);
    }

    selectSecondary(item: Item): void {

        let selectionGroup = this.panel.view.session.selectionGroup;
        let secondary = selectionGroup.getSelection(SelectionSlot.SECONDARY);

        if (item.type === secondary.type && item.id === secondary.id) {
            return;
        }

        let selection = new Selection(item.type, item.id);
        this.panel.view.session.selectionGroup.setSelection(SelectionSlot.SECONDARY, selection);
    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }
}

/**
 * The <i>ItemSelectorListener</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ItemSelectorListener {

    listeners: ((item: Item) => boolean)[];
    readonly selector: ItemSelector;

    constructor(selector: ItemSelector) {
        this.selector = selector;
    }

    init(): void {

        this.listeners = [];
        this.selector.app.stage.interactive = true;

        let compare = new Rectangle(0, 0, 1, 1);
        let select = (x: number, y: number, button: number): void => {

            if (button !== 0 && button !== 2) {
                return;
            }

            let item: Item = null;
            for (let key in this.selector.items) {
                let next = this.selector.items[key];

                compare.x = next.x;
                compare.y = next.y;
                compare.width = next.w;
                compare.height = next.h;

                if (compare.contains(x, y)) {
                    item = next;
                    break;
                }
            }

            if (item == null) {
                return;
            }

            if (button == 0) {
                this.selector.selectPrimary(item);
            } else if (button == 2) {
                this.selector.selectSecondary(item);
            }
        };

        let down = false;
        let button = -999999;

        this.selector.app.view.addEventListener('pointerleave', () => {
            down = false;
        });

        this.selector.app.view.addEventListener('pointerdown', (e: PointerEvent) => {
            down = true;
            button = e.button;
            select(e.offsetX, e.offsetY, button);
        });

        this.selector.app.view.addEventListener('pointerup', () => {
            down = false;
            button = -999999;
        });

        this.selector.app.view.addEventListener('pointermove', (e) => {

            if (!down) {
                return;
            }

            select(e.offsetX, e.offsetY, button);
        });
    }

}

/**
 * The abstract <i>Item</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class Item implements Dirtable {

    readonly id: string;

    type: string;
    outline: PIXI.Graphics;
    x: number;
    y: number;
    w: number;
    h: number;
    wt: number;
    ht: number;
    protected dirty: boolean;
    selector: ItemSelector;

    protected container: PIXI.Container;

    protected constructor(selector: ItemSelector, type: string, id: string) {

        this.selector = selector;
        this.type = type;
        this.id = id;

        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.wt = 0;
        this.ht = 0;
        this.container = new PIXI.Container();
        this.container.visible = false;

        this.outline = new PIXI.Graphics();
        this.container.addChild(this.outline);
    }

    drawOutline(): void {

        this.outline.clear();
        this.outline.visible = false;

        let selectionGroup = this.selector.panel.view.session.selectionGroup;
        let primary = selectionGroup.getSelection(SelectionSlot.PRIMARY);
        let secondary = selectionGroup.getSelection(SelectionSlot.SECONDARY);

        let isPrimary = primary.id === this.id && primary.type === this.type;
        let isSecondary = secondary.id === this.id && secondary.type === this.type;

        if (isPrimary || isSecondary) {

            let color = 0xFFFFFF;
            if (!isPrimary) {
                color = 0xFFFF00;
            } else if (!isSecondary) {
                color = 0xFF0000;
            }

            this.outline.visible = true;
            this.outline.lineStyle(1, color);

            let x1 = this.x + 1;
            let y1 = this.y;
            let x2 = (x1 + this.w) - 1;
            let y2 = (y1 + this.h) - 1;

            this.outline.moveTo(x1, y1);
            this.outline.lineTo(x2, y1);
            this.outline.lineTo(x2, y2);
            this.outline.lineTo(x1, y2);
            this.outline.lineTo(x1, y1);
        }
    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    update(): void {
        this.onUpdate();
    }

    abstract draw(): void;

    abstract onUpdate(): void;

    abstract getSourceWidth(): number;

    abstract getSourceHeight(): number;

    abstract getContainer(): PIXI.Container;
}

/**
 * The <i>SpriteItem</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SpriteItem extends Item {

    _sprite: PIXI.Sprite;
    sprite: MapSprite;
    lastOffset: number;

    constructor(selector: ItemSelector, type: string, id: string, sprite: MapSprite) {

        super(selector, type, id);

        this.sprite = sprite;
        this.lastOffset = -1;

        this._sprite = new PIXI.Sprite();
        this._sprite.width = 0;
        this._sprite.height = 0;

        this.container.addChild(this._sprite);
    }

    // @Override
    onUpdate(): void {

        this.sprite.update();

        if (this.isDirty() || this.lastOffset !== this.sprite.offset) {

            // Update the sprite's coordinates.
            this._sprite.x = this.x;
            this._sprite.y = this.y;
            this._sprite.width = this.w;
            this._sprite.height = this.h;

            // Update the texture.
            this.draw();

            // Reset the item's state.
            this.lastOffset = this.sprite.offset;
            this.setDirty(false);
        }
    }

    // @Override
    draw(): void {

        let sequence = this.sprite.sequence;
        if (sequence == null) {
            return;
        }

        this.drawOutline();

        this._sprite.texture = this.sprite.sequence[this.sprite.offset];
    }

    // @Override
    getContainer(): PIXI.Container {
        return this.container;
    }

    // @Override
    getSourceWidth(): number {
        return this.sprite.frameWidth;
    }

    // @Override
    getSourceHeight(): number {
        return this.sprite.frameHeight;
    }

    // @Override
    isDirty(): boolean {
        return this.dirty || this.sprite.isDirty();
    }

    // @Override
    setDirty(flag: boolean): void {

        this.dirty = flag;

        if (!flag) {
            this.sprite.setDirty(false);
        }
    }
}
