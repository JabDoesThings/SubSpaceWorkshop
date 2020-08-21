import UIPanelTab from './UIPanelTab';
import UIPanelSection from './UIPanelSection';
import SpriteItem from './SpriteItem';
import TileSection from './TileSection';
import { MapRenderer } from '../../editor/render/MapRenderer';
import { MapSprite } from '../../editor/render/MapSprite';
import { Project } from '../../editor/Project';
import { ItemSelector } from './ItemSelector';
import { EditorAction, EditorProjectEvent } from '../../editor/Editor';
import { CustomEvent, ItemSelectorEvent } from '../UIEvents';
import { ItemSelectorAction, SelectionType } from '../UIProperties';

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

export default PalettePanel;
