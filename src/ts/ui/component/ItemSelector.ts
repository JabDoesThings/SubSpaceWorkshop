import * as PIXI from "pixi.js";
import Item from './Item';
import ItemSelectorListener from '../ItemSelectorListener';
import { Dirtable } from '../../util/Dirtable';
import { PalettePanel } from './PalettePanel';
import { Selection } from './Selection';
import { CustomEventListener } from '../CustomEventListener';
import { ItemSelectorEvent } from '../UIEvents';
import { ItemSelectorAction } from '../UIProperties';

/**
 * The <i>ItemSelector</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ItemSelector extends CustomEventListener<ItemSelectorEvent> implements Dirtable {
  items: { [id: string]: Item };
  maxWidthTiles: number;
  maxHeightTiles: number;
  minYSlots: number;
  maxYSlots: number;
  tileSize: number;
  listener: ItemSelectorListener;
  hoveredItem: Item;
  hovered: boolean;
  panel: PalettePanel;
  app: PIXI.Application;
  private readonly container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private dirty: boolean;

  /**
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

export default ItemSelector;
