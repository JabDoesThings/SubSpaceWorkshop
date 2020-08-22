import { Zip } from '../io/Zip';
import { Bitmap } from '../io/Bitmap';
import { DEFAULT_TILESET, LVLMap, LVLTileSet, readTileset, writeLVL } from '../io/LVL';
import { DEFAULT_ATLAS } from './render/SubSpaceAtlas';
import { CustomEvent, CustomEventListener, UITab } from '../ui/UI';
import Editor from './Editor';
import EditManager from './EditManager';
import SelectionRenderer from './render/SelectionRenderer';
import TileData from '../util/map/TileData';
import LayerManager from './layers/LayerManager';
import MapRenderer from './render/MapRenderer';
import Layer from './layers/Layer';
import CoordinateType from '../util/map/CoordinateType';
import MapPoint from '../util/map/MapPoint';
import ProjectAtlas from './render/ProjectAtlas';
import Background from '../common/render/Background';
import EditLayerRemove from './edits/EditLayerRemove';
import EditSelectionClear from './edits/EditSelectionClear';
import EditSelectionAdd from './edits/EditSelectionAdd';
import Library from './data/library/Library';
import SelectionGroup from './ui/SelectionGroup';
import Selection from './ui/Selection';
import SelectionSlot from './ui/SelectionSlot';
import SelectionType from './ui/SelectionType';
import LayerLoader from './layers/LayerLoader';
import MapSections from '../util/map/MapSections';
import MapSection from '../util/map/MapSection';

/**
 * The <i>Project</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class Project extends CustomEventListener<CustomEvent> {
  library: Library;
  editor: Editor;
  editManager: EditManager;
  selectionGroup: SelectionGroup;
  layers: LayerManager;
  selections: MapSections;
  atlas: ProjectAtlas;
  tileset: LVLTileSet;
  tab: UITab;
  background: Background;
  selectionRenderer: SelectionRenderer;
  renderer: MapRenderer;
  _name: string;
  path: string;
  private readonly metadata: { [id: string]: any };

  /**
   * @param {MapRenderer} renderer
   * @param {string} name
   */
  constructor(renderer: MapRenderer, name: string) {
    super();
    this.renderer = renderer;
    this.editor = this.renderer.editor;
    this._name = name;
    this.tileset = DEFAULT_TILESET.clone();
    this.path = null;
    this.metadata = {};
    this.atlas = DEFAULT_ATLAS.clone();
    this.atlas.getTextureAtlas('tiles').setTexture(this.tileset.texture);
    this.atlas.addEventListener((event) => {
      this.dispatch(event);
    });

    this.layers = new LayerManager(this);
    this.editManager = new EditManager(this);
    this.selections = new MapSections();
    this.background = new Background(this, renderer, 0);
    this.selectionRenderer = new SelectionRenderer(this);
    this.selectionGroup = new SelectionGroup();
    this.selectionGroup.setSelection(SelectionSlot.PRIMARY, new Selection(SelectionType.TILE, 1));
    this.selectionGroup.setSelection(SelectionSlot.SECONDARY, new Selection(SelectionType.TILE, 2));
  }

  /** @return {Library} Returns the project's default library. */
  getLibrary(): Library {
    return this.library;
  }

  /**
   * Sets the default library for the project.
   *
   * @param {Library} library The library to set.
   */
  setLibrary(library: Library) {
    this.library = library;
  }

  saveAs(): void {
    this.save(true);
  }

  save(as: boolean): void {
    if (this.path == null || as) {
      const {dialog} = require('electron').remote;

      interface DialogResult {
        canceled: boolean;
        filePath: string;
        bookmark: string;
      }

      const promise: Promise<DialogResult> = dialog.showSaveDialog(null, {
          title: 'Save Project',
          buttonLabel: 'Save',
          filters: [
            {name: 'SubSpace Workshop Project', extensions: ['sswp']}
          ],
          properties: {
            dontAddToRecent: true
          }
        }
      );

      promise.then((result: DialogResult) => {
        if (result.canceled || result.filePath == null) {
          return;
        }

        // Ensure the file-name ends with the extension.
        let path = result.filePath;
        if (!path.toLowerCase().endsWith('.sswp')) {
          path += '.sswp';
        }

        this.path = path;

        Project.write(this).then(() => {
        });
      });
    }
  }

  preUpdate(): void {
    this.atlas.preUpdate();
    this.layers.preUpdate();
  }

  update(delta: number): void {
    this.atlas.update();
    this.layers.update(delta);
    this.background.update();
    this.selectionRenderer.update();
  }

  postUpdate(): void {
    this.atlas.postUpdate();
    this.layers.postUpdate();
    this.tileset.setDirty(false);
    this.background.setDirty(false);
    this.selectionGroup.setDirty(false);
    this.atlas.setDirty(false);
    this.selections.setDirty(false);
  }

  deleteSelectedLayer() {
    const selectedLayer = this.layers.getActive();
    if (selectedLayer == null || !selectedLayer.isVisible()) {
      return;
    }

    const edit = new EditLayerRemove(selectedLayer);
    this.editManager.append([edit]);
    this.editManager.push();
  }

  selectAllTiles() {
    const selectedLayer = this.layers.getActive();
    if (selectedLayer == null || !selectedLayer.isVisible()) {
      return;
    }

    const bounds = selectedLayer.getBounds();
    const edits = [
      new EditSelectionClear(),
      new EditSelectionAdd([MapSection.box(bounds.x1, bounds.y1, bounds.x2, bounds.y2)])
    ];
    this.editManager.append(edits);
    this.editManager.push();
  }

  mergeLayerDown() {
    // TODO: Write as Edit.
    const selectedLayer = this.layers.getActive();
    if (selectedLayer == null || !selectedLayer.isVisible()) {
      return;
    }

    let layerBelow;

    if (selectedLayer.hasParent()) {
      const children = selectedLayer.getParent().getChildren();
      for (let index = children.length - 1; index >= 0; index--) {
        const child = children[index];
        if (child === selectedLayer) {
          // If the selected layer is at the bottom of the stack, then there's nothing to merge.
          if (index === 0) {
            return;
          }
          layerBelow = children[index - 1];
          selectedLayer.getParent().removeChild(selectedLayer);
          break;
        }
      }
      if (!layerBelow) {
        return;
      }
    } else {
      const layers = this.layers.layers;
      for (let index = layers.length - 1; index >= 0; index--) {
        const layer = layers[index];
        if (layer === selectedLayer) {
          // If the selected layer is at the bottom of the stack, then there's nothing to merge.
          if (index === 0) {
            return;
          }
          layerBelow = layers[index - 1];
          this.layers.remove(layer);
          break;
        }
      }
      if (!layerBelow) {
        return;
      }
    }
    layerBelow.merge(selectedLayer);
  }

  sliceSelection(name: string = 'Sliced Layer') {
    // TODO: Write as Edit.
    const selectedLayer = this.layers.getActive();
    if (selectedLayer == null || !selectedLayer.isVisible()) {
      return;
    }

    const sections = this.selections.sections;
    if (sections == null || sections.length === 0) {
      return;
    }

    const bounds = this.selections.getBounds();
    const sliceLayer = new Layer(null, null, name);

    for (let y = bounds.y1; y <= bounds.y2; y++) {
      for (let x = bounds.x1; x <= bounds.x2; x++) {
        if (MapSection.isPositive(sections, new MapPoint(CoordinateType.TILE, x, y))) {
          const id = selectedLayer.getTile(x, y);
          sliceLayer.tiles.set(x, y, id);
          selectedLayer.tiles.set(x, y, 0);
        }
      }
    }

    this.layers.add(sliceLayer, true);
  }

  activate(): void {
    this.layers.onActivate(this.renderer);
    this.renderer.mapLayers.layers[1].addChild(this.background);
    this.renderer.mapLayers.layers[7].addChild(this.selectionRenderer.graphics);
  }

  setTileset(tileset: LVLTileSet) {
    if (tileset === this.tileset) {
      return;
    }
    this.tileset = tileset;
    tileset.setDirty(true);
    this.atlas.getTextureAtlas('tiles').setTexture(tileset.texture);
  }

  getMetadata(id: string): any {
    return this.metadata[id];
  }

  setMetadata(id: string, value: any): void {
    this.metadata[id] = value;
  }

  getMetadataTable(): { [id: string]: any } {
    return this.metadata;
  }

  static async read(path: string, onSuccess: (project: Project) => void, onError: (e: Error) => void) {
    if (path == null) {
      throw new Error('The path provided is null or undefined.');
    }
    if (onSuccess == null) {
      throw new Error('The onSuccess(project: Project) function given is null or undefined.');
    }
    if (onError == null) {
      throw new Error('The onError(error: Error) function given is null or undefined.');
    }
    const zip = new Zip();
    zip.read(path, async () => {
        let project: Project = null;
        if (!zip.exists('project.json')) {
          const error = new Error('The project.json file is missing.');
          onError(error);
          throw error;
        }

        const projectJson = JSON.parse(zip.get('project.json').toString());
        if (projectJson.layers == null) {
          const error = new Error('The project.json file is missing the \'layers\' section.');
          onError(error);
          throw error;
        }

        // @ts-ignore
        const renderer: MapRenderer = global.editor.renderer;
        project = new Project(renderer, projectJson.name);

        // Load metadata for the project.
        if (projectJson.metadata != null) {
          for (let o in projectJson.metadata) {
            const key: string = <string> o;
            const value = projectJson.metadata[key];
            project.setMetadata(key, value);
          }
        }

        // Load all layers in the project.
        const layers = project.layers;
        for (let o in projectJson.layers) {
          const id = <string> o;
          const next = projectJson.layers[id];
          let type = next.type;
          if (type == null) {
            type = 'default';
          }
          const layer = LayerLoader.get(type).onLoad(id, next, zip);
          layers.add(layer, false, false);
        }
        // await layers.combineTileLayers(true);
        layers.setActive(layers.layers[layers.layers.length - 1]);

        if (zip.exists('tileset.bmp')) {
          project.setTileset(readTileset(<Buffer> zip.get('tileset.bmp')));
        }
        if (zip.exists('library.sswl')) {
          await Library.read(zip.get('library.sswl'), library => {
              project.setLibrary(library);
            },
            (error: Error) => {
              throw error;
            });
        } else {
          project.setLibrary(new Library(null, 'Project Library'));
        }
        if (onSuccess != null) {
          onSuccess(project);
        }
      },
      (error: Error) => {
        onError(error);
      });
  }

  static async write(project: Project, path: string = null) {
    if (project == null) {
      throw new Error('The project given is null or undefined.');
    }
    if (path == null) {
      path = project.path;
    }
    if (path == null) {
      throw new Error('The path provided and the path in the project given are null or undefined.');
    }

    const zip = new Zip();
    const json: { [id: string]: any } = {};
    json.name = project._name;
    json.layers = {};

    const layers = project.layers.layers;
    for (let index = 0; index < layers.length; index++) {
      const next = layers[index];
      const id = next.getId();
      json.layers[id] = next.save(zip);
    }

    json.metadata = project.getMetadataTable();

    // Compile the tileset.
    if (project.tileset != null) {
      try {
        let source = project.editor.renderer.toCanvas(project.tileset.texture);
        zip.set('tileset.bmp', Bitmap.toBuffer(source, project.tileset.bitCount));
      } catch (e) {
        console.error("Failed to write project tileset to buffer.");
        console.error(e);
      }
    }

    zip.set('project.json', JSON.stringify(json, null, 2));

    const library = project.getLibrary();
    if (library) {
      await library.toBuffer((buffer) => {
        zip.set('library.sswl', buffer);
        zip.write(path);
      });
    } else {
      zip.write(path);
    }
  }

  static exportLVL(project: Project, path: string): void {
    const tiles = new TileData();
    for (let x = 0; x < 1024; x++) {
      for (let y = 0; y < 1024; y++) {
        let id = project.layers.getTile(x, y);
        if (id === -1) {
          id = 0;
        }
        tiles.set(x, y, id, null, false);
      }
    }

    const map = new LVLMap('name', tiles, project.tileset);
    writeLVL(map, path);
  }
}
