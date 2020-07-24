import { MapRenderer } from './MapRenderer';
import { Radar } from '../../common/Radar';
import { Editor } from '../Editor';

/**
 * The <i>MapRadar</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapRadar extends Radar {

  /**
   * @constructor
   *
   * @param {MapRenderer} view
   */
  constructor(view: MapRenderer) {
    super(view);
  }

  /** @override */
  async draw() {
    const project = (<MapRenderer> this.view).project;
    if (project == null) {
      return;
    }

    // Clear the radar to its clear color.
    this.drawCtx.fillStyle = '#010201';
    this.drawCtx.fillRect(0, 0, 1024, 1024);

    let tileset = project.tileset;
    let layers = project.layers;

    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        const tileId = layers.getTile(x, y);
        if (tileId > 0) {
          if (tileId <= 190) {
            if (tileset != null) {
              this.drawCtx.fillStyle = tileset.tileColor[tileId];
            } else {
              this.drawCtx.fillStyle = '#eeeeee';
            }
            this.drawCtx.fillRect(x, y, 1, 1);
          } else if (tileId == 216) {
            this.drawCtx.fillStyle = '#4b3225';
            this.drawCtx.fillRect(x, y, 1, 1);
          } else if (tileId == 217) {
            this.drawCtx.fillStyle = '#4b3225';
            this.drawCtx.fillRect(x, y, 2, 2);
          } else if (tileId == 218) {
            this.drawCtx.fillStyle = '#4b3225';
            this.drawCtx.fillRect(x, y, 1, 1);
          } else if (tileId == 219) {
            this.drawCtx.fillStyle = '#4b4b4b';
            this.drawCtx.fillRect(x, y, 6, 6);
          } else if (tileId == 220) {
            this.drawCtx.fillStyle = '#710066';
            this.drawCtx.fillRect(x, y, 5, 5);
          } else {
            this.drawCtx.fillStyle = '#d500d5';
            this.drawCtx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  }

  /** @override */
  isAltPressed(): boolean {
    // @ts-ignore
    let editor: Editor = global.editor;
    // Make sure that selection tools do not get interrupted by the alt function of the radar.
    let activeTool = editor.renderer.toolManager.getActive();
    if (activeTool != null && activeTool.isSelector) {
      return false;
    }
    return editor.isAltPressed();
  }
}
