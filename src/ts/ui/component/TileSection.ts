import PalettePanel from './PalettePanel';
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;
import Selection from './Selection';
import { LVLTileSet } from '../../io/LVL';
import { SelectionSlot, SelectionType } from '../UIProperties';

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
  last: LVLTileSet;

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

    const update = (button: number, mx: number, my: number): void => {
      const tx = (mx - (mx % 16)) / 16;
      const ty = (my - (my % 16)) / 16;
      if (tx >= 0 && tx < 19 && ty >= 0 && ty < 10) {
        const selection = new Selection(SelectionType.TILE, this.atlas[ty][tx]);
        let slot: SelectionSlot;
        if (button == 0) {
          slot = SelectionSlot.PRIMARY;
        } else if (button == 2) {
          slot = SelectionSlot.SECONDARY;
        }
        this.panel.renderer.project.selectionGroup.setSelection(slot, selection);
      }
    };

    $(this.canvas).on('mousedown', (e: MouseDownEvent) => {
      down = true;
      const button = e.button;
      downButton = button;
      const mx = e.offsetX;
      const my = e.offsetY;
      update(button, mx, my);
    });

    $(document).on('mouseup', () => {
      down = false;
      downButton = -99999;
    });

    $(this.canvas).on('mousemove', (e: MouseMoveEvent) => {
      if (down) {
        let button = e.button;
        const mx = e.offsetX;
        const my = e.offsetY;
        if (downButton !== -99999) {
          button = downButton;
        }
        update(button, mx, my);
      }
    });
  }

  update(): void {
    const project = this.panel.renderer.project;
    if (project == null) {
      return;
    }
    const tileset = project.tileset;
    if (this.last !== tileset || (tileset != null && tileset.isDirty())
      || (this.panel.renderer.project != null && this.panel.renderer.project.selectionGroup.isDirty())) {
      this.draw();
      this.last = tileset;
    }
  }

  draw(): void {
    const ctx = this.canvas.getContext('2d');
    const project = this.panel.renderer.project;
    if (project == null) {
      return;
    }
    const tileset = project.tileset;
    if (tileset != null) {
      const tex = tileset.texture;
      if (!tex.valid) {
        tex.addListener('loaded', () => {
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, 304, 160);
          ctx.drawImage(project.editor.renderer.toCanvas(tileset.texture), 0, 0);
        });
      } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 304, 160);
        ctx.drawImage(project.editor.renderer.toCanvas(tileset.texture), 0, 0);
      }
    }

    const selectionGroup = this.panel.renderer.project.selectionGroup;
    const primary = selectionGroup.getSelection(SelectionSlot.PRIMARY);
    const secondary = selectionGroup.getSelection(SelectionSlot.SECONDARY);

    const draw = (tile: number, color: string) => {
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

    const combinedColor = 'rgba(255, 255, 255, 1)';
    const primaryColor = 'rgba(255, 0, 0, 1)';
    const secondaryColor = 'rgba(255, 255, 0, 1)';

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

export default TileSection;
