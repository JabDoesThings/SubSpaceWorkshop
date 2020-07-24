import * as PIXI from "pixi.js";
import { MapSprite } from '../render/MapSprite';
import { Dirtable } from '../../util/Dirtable';
import Rectangle = PIXI.Rectangle;
import { PalettePanel } from './PalettePanel';
import { SelectionSlot, Selection } from './Selection';
import { CustomEvent, CustomEventListener } from './CustomEventListener';

/**
 * The <i>ItemSelector</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ItemSelector extends CustomEventListener<ItemSelectorEvent> implements Dirtable {

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
  hoveredItem: Item;
  hovered: boolean;
  panel: PalettePanel;

  /**
   * @constructor
   *
   * @param {PalettePanel} panel
   * @param {HTMLElement} container
   */
  constructor(panel: PalettePanel, container: HTMLElement = null) {
    super();
    this.panel = panel;
    if (container == null) {
      container = document.createElement('div');
    }
    this.container = container;
    this.items = {};
    this.tileSize = 16;
    this.maxWidthTiles = 8;
    this.maxHeightTiles = 8;
    this.minYSlots = 1;
    this.maxYSlots = 256;
    this.dirty = true;
    this.hovered = false;
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
          const next = this.items[id];
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

    this.app.stage.sortDirty = false;
    this.app.stage.sortableChildren = false;
    this.app.stage.interactive = false;
    this.app.stage.interactiveChildren = false;
    this.listener = new ItemSelectorListener(this);
    this.listener.init();
  }

  draw(comparator: (a: Item, b: Item) => number = null): boolean {
    if (comparator == null) {
      comparator = ((a, b) => {
        return (b.getSourceWidth() * b.getSourceHeight()) - (a.getSourceWidth() * a.getSourceHeight());
      });
    }
    if (this.dispatch({
      eventType: "ItemSelectorEvent",
      item: null,
      action: ItemSelectorAction.PRE_DRAW,
      forced: false
    })) {
      return true;
    }

    this.app.stage.removeChildren();

    let xSlots = Math.floor(Math.floor(this.canvas.width) / 16);
    let ySlots = this.maxYSlots;

    let slots: boolean[][] = [];
    for (let x = 0; x < xSlots; x++) {
      slots[x] = [];
      for (let y = 0; y < ySlots; y++) {
        slots[x][y] = false;
      }
    }

    const addRow = (): boolean => {
      if (ySlots + 1 > this.maxYSlots) {
        return false;
      }
      for (let x = 0; x < xSlots; x++) {
        slots[x][ySlots] = false;
      }
      ySlots++;
      return true;
    };

    const attempt = (width: number, height: number): { x: number, y: number } => {
      for (let y = 0; y < ySlots; y++) {
        for (let x = 0; x < slots.length; x++) {
          let room = true;
          try {
            for (let j = 0; j < height; j++) {
              for (let i = 0; i < width; i++) {
                if (slots[x + i][y + j]) {
                  room = false;
                  break;
                }
              }
              if (!room) {
                break;
              }
            }
          } catch (e) {
            room = false;
          }
          if (room) {
            return {x: x, y: y};
          }
        }
      }
      return null;
    };

    const getSpot = (item: Item): { x: number, y: number } => {
      const width = item.getSourceWidth();
      const height = item.getSourceHeight();
      if (width == 0 || height == 0) {
        console.log("\tItem width and height are zero.");
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

    const sorted = [];
    for (let key in this.items) {
      sorted.push(this.items[key]);
    }
    sorted.sort(comparator);

    let largestTileY = 1;
    for (let index = 0; index < sorted.length; index++) {
      const next = sorted[index];
      const spot = getSpot(next);
      if (spot == null) {
        next.getContainer().visible = false;
        continue;
      }

      next.getContainer().visible = true;
      next.x = spot.x * this.tileSize;
      next.y = spot.y * this.tileSize;
      next.setDirty(true);

      this.app.stage.addChild(next.getContainer());

      const x1 = spot.x;
      const y1 = spot.y;
      const x2 = x1 + next.wt;
      const y2 = y1 + next.ht;
      for (let y = y1; y < y2; y++) {
        for (let x = x1; x < x2; x++) {
          slots[x][y] = true;
        }
      }
      if (y2 > largestTileY) {
        largestTileY = y2;
      }
    }

    this.app.renderer.resize(this.app.renderer.width, largestTileY * this.tileSize);
    this.dispatch({
      eventType: 'ItemSelectorEvent',
      item: null,
      action: ItemSelectorAction.POST_DRAW,
      forced: true
    });
    return false;
  }

  add(entry: Item): void {
    if (entry == null) {
      throw new Error('The Entry given is null or undefined.');
    }
    this.items[entry.id] = entry;
    this.setDirty(true);
  }

  remove(entry: string | Item): void {
    if (entry == null) {
      throw new Error('The Entry given is null or undefined.');
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

  getSelected(slot: number): Item {
    const selectionGroup = this.panel.renderer.project.selectionGroup;
    const selection = selectionGroup.getSelection(slot);
    if (selection == null) {
      return null;
    }
    for (let id in this.items) {
      const next = this.items[id];
      if (next.id == selection.id && next.type === selection.type) {
        return next;
      }
    }
    return null;
  }

  setSelected(slot: number, item: Item): void {
    const selectionGroup = this.panel.renderer.project.selectionGroup;
    const previousItem = this.getSelected(slot);
    if (item != null) {
      selectionGroup.setSelection(slot, new Selection(item.type, item.id));
      item.drawOutline();
    } else {
      selectionGroup.setSelection(slot, null);
    }
    if (previousItem != null) {
      previousItem.drawOutline();
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
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

  readonly selector: ItemSelector;
  listeners: ((item: Item) => boolean)[];
  private readonly _compare: Rectangle;

  /**
   * @constructor
   *
   * @param {ItemSelector} selector
   */
  constructor(selector: ItemSelector) {
    this.selector = selector;
    this._compare = new Rectangle(0, 0, 1, 1);
  }

  getItem(x: number, y: number): Item {
    for (let key in this.selector.items) {
      const next = this.selector.items[key];
      this._compare.x = next.x;
      this._compare.y = next.y;
      this._compare.width = next.w;
      this._compare.height = next.h;
      if (this._compare.contains(x, y)) {
        return next;
      }
    }
    return null;
  }

  init(): void {
    this.listeners = [];
    this.selector.app.stage.interactive = true;
    const select = (x: number, y: number, button: number): boolean => {
      if (button !== 0 && button !== 2) {
        return;
      }
      const item = this.getItem(x, y);
      if (item == null) {
        return;
      }
      if (this.selector.dispatch({
        eventType: 'ItemSelectorEvent',
        item: item,
        action: ItemSelectorAction.SELECT_ITEM,
        forced: false
      })) {
        return true;
      }
      this.selector.setSelected(button, item);
      return false;
    };

    let down = false;
    let button = -999999;
    this.selector.app.view.addEventListener('pointerleave', () => {
      down = false;
      this.selector.hoveredItem = null;
      this.selector.hovered = false;
      this.selector.dispatch({
        eventType: "ItemSelectorEvent",
        item: null,
        action: ItemSelectorAction.HOVER_EXIT,
        forced: true
      });
    });
    this.selector.app.view.addEventListener('pointerenter', () => {
      this.selector.hovered = true;
      this.selector.dispatch({
        eventType: "ItemSelectorEvent",
        item: null,
        action: ItemSelectorAction.HOVER_ENTER,
        forced: true
      });
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
      const mx = e.offsetX;
      const my = e.offsetY;
      if (!down) {
        let item = this.getItem(mx, my);
        if (this.selector.hoveredItem !== item) {
          this.selector.dispatch({
            eventType: "ItemSelectorEvent",
            item: item,
            action: ItemSelectorAction.HOVER_ITEM,
            forced: true
          });
          this.selector.hoveredItem = item;
        }
      } else {
        select(mx, my, button);
      }
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
  selector: ItemSelector;
  protected dirty: boolean;
  protected container: PIXI.Container;

  /**
   * @constructor
   *
   * @param {ItemSelector} selector
   * @param {string} type
   * @param {string} id
   */
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

  isPrimary(): boolean {
    const selectionGroup = this.selector.panel.renderer.project.selectionGroup;
    const primary = selectionGroup.getSelection(SelectionSlot.PRIMARY);
    return primary.id === this.id && primary.type === this.type;
  }

  isSecondary(): boolean {
    const selectionGroup = this.selector.panel.renderer.project.selectionGroup;
    const secondary = selectionGroup.getSelection(SelectionSlot.SECONDARY);
    return secondary.id === this.id && secondary.type === this.type;
  }

  drawOutline(): void {
    this.outline.clear();
    this.outline.visible = false;
    const isPrimary = this.isPrimary();
    const isSecondary = this.isSecondary();
    if (isPrimary || isSecondary) {
      let color = 0xFFFFFF;
      if (!isPrimary) {
        color = 0xFFFF00;
      } else if (!isSecondary) {
        color = 0xFF0000;
      }

      this.outline.visible = true;
      this.outline.lineStyle(1, color);

      const x1 = this.x + 1;
      const y1 = this.y;
      const x2 = (x1 + this.w) - 1;
      const y2 = (y1 + this.h) - 1;
      this.outline.moveTo(x1, y1);
      this.outline.lineTo(x2, y1);
      this.outline.lineTo(x2, y2);
      this.outline.lineTo(x1, y2);
      this.outline.lineTo(x1, y1);
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
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
  hoverAlphaMin: number = 0.25;
  hoverAlphaIncrement: number = 0.1;

  /**
   * @constructor
   *
   * @param {ItemSelector} selector
   * @param {string} type
   * @param {string} id
   * @param {MapSprite} sprite
   */
  constructor(selector: ItemSelector, type: string, id: string, sprite: MapSprite) {
    super(selector, type, id);
    this.sprite = sprite;
    this.lastOffset = -1;
    this._sprite = new PIXI.Sprite();
    this._sprite.width = 0;
    this._sprite.height = 0;
    this.container.removeChildren();
    this.container.addChild(this._sprite);
    this.container.addChild(this.outline);
    this.container.sortableChildren = false;
    this.container.sortDirty = false;
    this.container.interactive = false;
    this.container.interactiveChildren = false;
  }

  /** @override */
  onUpdate(): void {
    if (this.selector.hovered && !this.isPrimary() && !this.isSecondary() && this.selector.hoveredItem !== this) {
      if (this._sprite.alpha > this.hoverAlphaMin) {
        this._sprite.alpha -= this.hoverAlphaIncrement;
        if (this._sprite.alpha < this.hoverAlphaMin) {
          this._sprite.alpha = this.hoverAlphaMin;
        }
      }
    } else {
      if (this.selector.hovered) {
        this._sprite.alpha = 1.0;
      } else {
        if (this._sprite.alpha < 1) {
          this._sprite.alpha += this.hoverAlphaIncrement;
          if (this._sprite.alpha < 1) {
            this._sprite.alpha = 1;
          }
        }
      }
    }
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

  /** @override */
  draw(): void {
    const sequence = this.sprite.sequence;
    if (sequence == null) {
      return;
    }
    this.sprite.draw(this._sprite);
  }

  /** @override */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /** @override */
  getSourceWidth(): number {
    return this.sprite.frameWidth;
  }

  /** @override */
  getSourceHeight(): number {
    return this.sprite.frameHeight;
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty || this.sprite.isDirty();
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
    if (!flag) {
      this.sprite.setDirty(false);
    }
  }
}

/**
 * The <i>ItemSelectorAction</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum ItemSelectorAction {
  HOVER_ITEM = 'hover-item',
  HOVER_ENTER = 'hover-enter',
  HOVER_EXIT = 'hover-exit',
  SELECT_ITEM = 'select-item',
  PRE_DRAW = 'pre-draw',
  POST_DRAW = 'post-draw'
}

/**
 * The <i>ItemSelectorEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface ItemSelectorEvent extends CustomEvent {
  item: Item;
  action: ItemSelectorAction;
}
