import MapRenderer from './MapRenderer';
import * as PIXI from "pixi.js";
import MapSprite from './MapSprite';
import ChromaFilter from './ChromaFilter';

export default class ToolCursor {

  chromaFilter: ChromaFilter;

  private renderer: MapRenderer;
  private dirty: boolean = true;
  private readonly sprite: PIXI.Sprite;

  constructor(renderer: MapRenderer) {
    this.renderer = renderer;
    this.sprite = new PIXI.Sprite();
    this.sprite.x = 200;
    this.sprite.y = 200;
    this.sprite.roundPixels = true;
    this.sprite.blendMode = PIXI.BLEND_MODES.OVERLAY;
    this.chromaFilter = new ChromaFilter(0,0,0, 0, 0);
    this.sprite.filters = [this.chromaFilter];
  }

  set(): void {
    this.renderer.screenContainer.addChild(this.sprite);
  }

  update(delta: number): void {

    // Debug code
    this.dirty = true;
    //

    if (this.dirty) {
      this.draw();
      this.dirty = false;
    }
  }

  draw(): void {

    const texture: PIXI.Texture = this.getTexture();
    if (texture == null) {
      return;
    }

    const camera = this.renderer.camera;
    const screen = this.renderer.app.screen;
    const mouse = this.renderer.mouse;
    const mapSpace = camera.toMapSpace(mouse[0], mouse[1], screen.width, screen.height);

    let tx = mapSpace.tileX;
    let ty = mapSpace.tileY;

    if (tx < 0) {
      tx = 0;
    } else if (tx > 1023) {
      tx = 1023;
    }

    if (ty < 0) {
      ty = 0;
    } else if (ty > 1023) {
      ty = 1023;
    }

    const cx = camera.position.x;
    const cy = camera.position.y;
    const cs = camera.position.scale;
    const tileWidth = 16 * cs;

    this.sprite.x = ((tx * tileWidth) - (cx * tileWidth)) + (screen.width / 2.0);
    this.sprite.y = ((ty * tileWidth) - (cy * tileWidth)) + (screen.height / 2.0);
    this.sprite.scale.x = cs;
    this.sprite.scale.y = cs;

    // FIX: This is a fix for magnifying above a 1:1 scale and having offset artifacts.
    if (tileWidth > 16) {
      this.sprite.x -= 1;
      this.sprite.y -= 1;
    }

    this.sprite.texture = texture;
    this.dirty = false;
  }

  getTexture(): PIXI.Texture {
    const project = this.renderer.project;
    if (project == null) {
      return;
    }

    const selectionGroup = project.selectionGroup;
    const selection = selectionGroup.getSelection(0);
    if (selection == null) {
      return;
    }

    let mapSprite: MapSprite = null;
    let texture: PIXI.Texture = null;

    if (selection.type === 'tile') {
      const tileId = selection.id;
      const texAtlas = project.atlas.tileset;
      if (tileId < 191) {
        if (tileId >= 162 && tileId <= 165) {
          mapSprite = texAtlas.getDoorTile(1);
        } else if (tileId >= 166 && tileId <= 169) {
          mapSprite = texAtlas.getDoorTile(2);
        } else if (tileId == 170) {
          mapSprite = project.atlas.getTextureAtlas('flag').getSpriteById('flagblue');
        } else if (tileId == 172) {
          mapSprite = project.atlas.getTextureAtlas('goal').getSpriteById('goalblue');
        } else {
          mapSprite = texAtlas.getTile(<number> selection.id);
        }
      } else {
        if (tileId >= 216 && tileId <= 220) {
          if (tileId == 216) {
            mapSprite = project.atlas.getTextureAtlas('over1').getSpriteById('over1');
          } else if (tileId == 217) {
            mapSprite = project.atlas.getTextureAtlas('over2').getSpriteById('over2');
          } else if (tileId == 218) {
            mapSprite = project.atlas.getTextureAtlas('over3').getSpriteById('over3');
          } else if (tileId == 219) {
            mapSprite = project.atlas.getTextureAtlas('over4').getSpriteById('over4');
          } else if (tileId == 220) {
            mapSprite = project.atlas.getTextureAtlas('over5').getSpriteById('over5');
          }
        } else if (tileId == 252) {
          mapSprite = project.atlas.getTextureAtlas('wall').getSpriteById('wallblue');
        } else if (tileId == 253) {
          mapSprite = project.atlas.getTextureAtlas('wall').getSpriteById('wallyellow');
        } else if (tileId == 255) {
          mapSprite = project.atlas.getTextureAtlas('prizes').getSpriteById('prizes');
        } else if (tileId == 191) {
          texture = project.atlas.getTextureAtlas('tile191').texture;
        } else if (tileId == 241) {
          texture = project.atlas.getTextureAtlas('tilenoweapon').texture;
        } else if (tileId == 242) {
          texture = project.atlas.getTextureAtlas('tilenothor').texture;
        } else if ((tileId >= 243 && tileId <= 251)) {
          texture = project.atlas.getTextureAtlas('tilenoradar').texture;
        } else if (tileId == 254) {
          texture = project.atlas.getTextureAtlas('tilenobrick').texture;
        } else {
          texture = project.atlas.getTextureAtlas('tile').texture;
        }
      }
    }

    if (mapSprite != null) {
      return mapSprite.getCurrentTexture();
    } else if (texture != null) {
      return texture;
    } else {
      return null;
    }
  }
}
