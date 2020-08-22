import TileData from '../../util/map/TileData';
import Renderer from '../../common/render/Renderer';
import Project from '../Project';
import MapRenderer from './MapRenderer';
import TileChunk from './TileChunk';

/**
 * The <i>TileRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class TileRenderer {
  readonly chunks: TileChunk[][] = [];
  readonly renderer: MapRenderer;
  readonly project: Project;
  readonly data: TileData;
  readonly container: PIXI.Container;

  /**
   * @param {Project} project
   * @param {TileData} data
   */
  constructor(project: Project, data: TileData) {
    this.project = project;
    this.renderer = project.renderer;
    this.data = data;
    this.container = new PIXI.Container();
    this.container.filters = [Renderer.chromaFilter];
    this.container.filterArea = this.renderer.app.screen;
    for (let x = 0; x < 16; x++) {
      this.chunks[x] = [];
      for (let y = 0; y < 16; y++) {
        const chunk = new TileChunk(project, this.data, x, y);
        chunk.init();
        this.chunks[x][y] = chunk;
        this.container.addChild(chunk.tileMap);
        this.container.addChild(chunk.tileMapAnim);
      }
    }
  }

  update(delta: number): void {
    // ### DEBUG CODE ###
    //
    // let dirtyAreas = this.data.dirtyAreas;
    // if(dirtyAreas.length > 0) {
    //     let text = 'DIRTY AREAS: [\n';
    //     for(let index = 0; index < dirtyAreas.length; index++) {
    //         let next = dirtyAreas[index];
    //         text += '\n\t{x1: ' + next.x1 + ", y1: " + next.y1 + ", x2: " + next.x2 + ", y2: " + next.y2 + "},";
    //     }
    //     text += '\n]';
    //     console.log(text);
    // }
    //
    // ### DEBUG CODE ###
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        this.chunks[x][y].update(delta);
      }
    }
  }

  draw(): void {
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        this.chunks[x][y].draw();
      }
    }
  }

  onActivate(renderer: MapRenderer): void {
    renderer.mapLayers.layers[2].addChild(this.container);
  }
}
