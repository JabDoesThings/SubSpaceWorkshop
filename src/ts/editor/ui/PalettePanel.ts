import { MapRenderer } from '../render/MapRenderer';
import { MapSprite } from '../render/MapSprite';
import { Project } from '../Project';
import { LVLTileSet } from '../../io/LVL';
import { ItemSelector, ItemSelectorAction, ItemSelectorEvent, SpriteItem } from './ItemSelector';
import { Selection, SelectionSlot, SelectionType } from './Selection';
import { UIPanelSection, UIPanelTab } from './UI';
import { CustomEvent } from './CustomEventListener';
import { EditorAction, EditorProjectEvent } from '../Editor';
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
  projectListener: (event: CustomEvent) => void | boolean;
  private lastProject: Project;
  private sectionStandardTile: UIPanelSection;
  private sectionSpecialTile: UIPanelSection;
  private sectionMapImage: UIPanelSection;
  private contentFrameResize: boolean = false;
  private dirty: boolean;

  /**
   * @constructor
   *
   * @param {MapRenderer} renderer
   */
  constructor(renderer: MapRenderer) {
    super('palette');
    this.renderer = renderer;
    this.projectListener = (event: CustomEvent): void => {
      if (event.eventType == 'EditorProjectEvent') {
        const editorEvent = <EditorProjectEvent> event;
        if (editorEvent.action == EditorAction.PROJECT_ACTIVATED) {

        }
      }
    };

    const width = 306;
    this.sectionStandardTile = this.createSection('standard-tiles', 'Standard Tiles');
    this.sectionSpecialTile = this.createSection('special-tiles', 'Special Tiles');
    this.sectionMapImage = this.createSection('map-images', 'Map Images');

    const standardTileDiv = document.createElement('div');
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

    this.dirty = true;
  }

  update(): void {
    const project = this.renderer.project;
    if (project == null) {
      return;
    }

    const atlas = project.atlas;
    const shouldDraw = project.tileset.isDirty() || this.dirty || atlas.isDirty() || project !== this.lastProject;
    if (shouldDraw) {
      this.createTileSprites(project);
      this.selectorStandardTile.draw();
      this.selectorSpecialTile.draw();
      this.createLVZAssets(project);
      this.sectionMapImage.open();

      if (!this.contentFrameResize) {
        this.contentFrameResize = true;
        setTimeout(() => {
          $(document.body).find('.side-panel.right .content-frame').each(function () {
            if (this.parentElement != null && this.parentElement.classList.contains('open')) {
              this.style.maxHeight = `${this.scrollHeight}px`;
            } else {
              this.style.maxHeight = null;
            }
          });
          this.contentFrameResize = false;
        }, 20);
      }
    }

    this.selectorStandardTile.update();
    this.lastProject = project;
  }

  createTileSprites(project: Project): void {
    this.selectorSpecialTile.clear();

    const add = (id: string, sprite: MapSprite, selector: ItemSelector): void => {
      if (sprite == null) {
        throw new Error(`The sprite given is null for the id: ${id}`);
      }
      const item = new SpriteItem(selector, SelectionType.TILE, id, sprite);
      selector.add(item);
    };

    const atlas = project.atlas;
    add('191', atlas.getTextureAtlas('tile191').getSpriteById('tile191'), this.selectorSpecialTile);
    add('192', atlas.getTextureAtlas('tile').getSpriteById('tile'), this.selectorSpecialTile);
    add('216', atlas.getTextureAtlas('over1').getSpriteById('over1'), this.selectorSpecialTile);
    add('217', atlas.getTextureAtlas('over2').getSpriteById('over2'), this.selectorSpecialTile);
    add('218', atlas.getTextureAtlas('over3').getSpriteById('over3'), this.selectorSpecialTile);
    add('219', atlas.getTextureAtlas('over4').getSpriteById('over4'), this.selectorSpecialTile);
    add('220', atlas.getTextureAtlas('over5').getSpriteById('over5'), this.selectorSpecialTile);
    add('241', atlas.getTextureAtlas('tilenoweapon').getSpriteById('tilenoweapon'), this.selectorSpecialTile);
    add('242', atlas.getTextureAtlas('tilenothor').getSpriteById('tilenothor'), this.selectorSpecialTile);
    add('243', atlas.getTextureAtlas('tilenoradar').getSpriteById('tilenoradar'), this.selectorSpecialTile);
    add('252', atlas.getTextureAtlas('wall').getSpriteById('wallblue'), this.selectorSpecialTile);
    add('253', atlas.getTextureAtlas('wall').getSpriteById('wallyellow'), this.selectorSpecialTile);
    add('254', atlas.getTextureAtlas('tilenobrick').getSpriteById('tilenobrick'), this.selectorSpecialTile);
    add('255', atlas.getTextureAtlas('prizes').getSpriteById('prizes'), this.selectorSpecialTile);
  }

  createLVZAssets(project: Project): void {

    // this.selectorMapImage.clear();

    // let packages = session.lvzManager.packages;
    // if (packages == null || packages.length == 0) {
    //     return;
    // }
    //
    // let add = (id: string, sprite: MapSprite, selector: ItemSelector): void => {
    //
    //     let item = new SpriteItem(selector, SelectionType.IMAGE, id, sprite);
    //     selector.add(item);
    //     let callbacks = session.cache.callbacks[id];
    //     if (callbacks == null) {
    //         callbacks = session.cache.callbacks[id] = [];
    //     }
    //     callbacks.push(() => {
    //         this.selectorMapImage.setDirty(true);
    //     });
    // };
    //
    // let isRestricted = (name: string): boolean => {
    //     name = name.split('.')[0].toLowerCase();
    //
    //     for (let index = 0; index < LVZManager.LVZ_EXEMPT_IMAGES.length; index++) {
    //         if (LVZManager.LVZ_EXEMPT_IMAGES[index] === name) {
    //             return true;
    //         }
    //     }
    //
    //     return false;
    // };
    //
    // for (let key in packages) {
    //
    //     let pkg = packages[key];
    //
    //     if (pkg.images.length === 0) {
    //         continue;
    //     }
    //
    //     for (let index = 0; index < pkg.images.length; index++) {
    //
    //         let fileName = pkg.images[index].fileName;
    //
    //         if (isRestricted(fileName)) {
    //             continue;
    //         }
    //
    //         let id = pkg.name.toLowerCase() + ">>>" + index;
    //         let sprite: MapSprite = session.atlas.getSpriteById(id);
    //
    //         if (sprite == null) {
    //             continue;
    //         }
    //
    //         add(id, sprite, this.selectorMapImage);
    //     }
    // }
    //
    this.dirty = false;
  }

  draw(): void {
    this.selectorStandardTile.draw();
    this.selectorSpecialTile.draw();
    // this.selectorMapImage.draw();
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
