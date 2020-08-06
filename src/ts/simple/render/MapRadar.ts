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

    const timeStart = new Date().getTime();

    // Clear the radar to its clear color.
    this.drawCtx.fillStyle = '#010201';
    this.drawCtx.fillRect(0, 0, 1024, 1024);

    const tileset = project.tileset;
    const layers = project.layers;

    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        const tileId = layers.getTile(x, y);
        if (tileId > 0) {
          let dim = 1;
          switch (tileId) {
            case 216:
              this.drawCtx.fillStyle = '#4b3225';
              break;
            case 217:
              dim = 2;
              this.drawCtx.fillStyle = '#4b3225';
              break;
            case 218:
              this.drawCtx.fillStyle = '#4b3225';
              break;
            case 219:
              this.drawCtx.fillStyle = '#4b4b4b';
              dim = 6;
              break;
            case 220:
              this.drawCtx.fillStyle = '#710066';
              dim = 5;
              break;
            default:
              if (tileset != null) {
                this.drawCtx.fillStyle = tileset.tileColor[tileId];
              } else {
                this.drawCtx.fillStyle = '#eeeeee';
              }
              break;
          }
        }
      }
    }
    console.log(`Radar drawn. Took ${new Date().getTime() - timeStart}ms.`);
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

