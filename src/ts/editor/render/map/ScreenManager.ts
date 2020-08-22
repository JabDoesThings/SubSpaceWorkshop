import MapRenderer from '../MapRenderer';
import LVZScreenEntry from './LVZScreenEntry';

/**
 * The <i>ScreenManager</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ScreenManager {
  private renderer: MapRenderer;
  private previousScreen: PIXI.Rectangle = new PIXI.Rectangle();
  private animatedObjects: LVZScreenEntry[] = [];
  private dirty: boolean = true;

  /**
   * @param {MapRenderer} renderer
   */
  constructor(renderer: MapRenderer) {
    this.renderer = renderer;
  }

  update(): void {
    const screen = this.renderer.app.screen;
    if (this.dirty || this.previousScreen.x !== screen.x
      || this.previousScreen.y !== screen.y
      || this.previousScreen.width !== screen.width
      || this.previousScreen.height !== screen.height) {
      this.draw();
    }
    if (this.animatedObjects.length !== 0) {
      for (let index = 0; index < this.animatedObjects.length; index++) {
        ScreenManager.drawEntry(this.animatedObjects[index]);
      }
    }
  }

  draw(): void {
    const screen = this.renderer.app.screen;
    this.previousScreen.x = screen.x;
    this.previousScreen.y = screen.y;
    this.previousScreen.width = screen.width;
    this.previousScreen.height = screen.height;
  }

  private static drawEntry(entry: LVZScreenEntry): void {
    if (entry.sprite == null) {
      return;
    }
    if (entry.sprite.sequence != null) {
      let offset = entry.sprite.offset;
      if (entry.sprite.sequence.length > offset) {
        entry._sprite.texture = entry.sprite.sequence[entry.sprite.offset];
      }
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @Override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }
}
