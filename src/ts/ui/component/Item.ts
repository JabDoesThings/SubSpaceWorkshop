import { Dirtable } from '../../util/Dirtable';
import { ItemSelector } from './ItemSelector';
import { SelectionSlot } from '../UIProperties';

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

export default Item;
