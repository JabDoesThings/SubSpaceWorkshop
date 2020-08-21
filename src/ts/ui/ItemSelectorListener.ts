import ItemSelector from './component/ItemSelector';
import Item from './component/Item';
import Rectangle = PIXI.Rectangle;
import { ItemSelectorAction } from './UIProperties';

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

export default ItemSelectorListener;
