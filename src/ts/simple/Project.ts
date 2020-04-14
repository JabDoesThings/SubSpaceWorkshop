import { DEFAULT_ATLAS } from '../main';
import { Editor } from './Editor';
import { Selection, SelectionGroup, SelectionSlot, SelectionType } from './ui/Selection';
import { UITab } from './ui/UI';
import { CustomEvent, CustomEventListener } from './ui/CustomEventListener';
import { ProjectAtlas } from './render/ProjectAtlas';
import { EditManager } from './EditManager';
import { LayerManager } from './layers/LayerManager';
import { MapSections } from '../util/map/MapSection';
import { LVLMap, LVLTileSet } from '../io/LVL';
import { LVL } from '../io/LVLUtils';
import { Background } from '../common/Background';
import { SelectionRenderer } from './render/SelectionRenderer';
import { MapRenderer } from './render/MapRenderer';
import { Zip } from '../io/Zip';
import { Layer, LayerLoader } from './layers/Layer';
import { Bitmap } from '../io/Bitmap';
import { TileData } from '../util/map/TileData';

/**
 * The <i>Project</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Project extends CustomEventListener<CustomEvent> {

    private readonly metadata: { [id: string]: any };

    editor: Editor;
    editManager: EditManager;
    selectionGroup: SelectionGroup;
    layers: LayerManager;
    selections: MapSections;
    atlas: ProjectAtlas;
    tileset: LVLTileSet;
    tab: UITab;
    _name: string;

    background: Background;
    selectionRenderer: SelectionRenderer;

    renderer: MapRenderer;
    path: string;

    /**
     * Main constructor.
     *
     * @param renderer
     * @param name
     */
    constructor(renderer: MapRenderer, name: string) {

        super();

        this.renderer = renderer;
        this.editor = this.renderer.editor;
        this._name = name;
        this.tileset = LVL.DEFAULT_TILESET.clone();
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

    saveAs(): void {
        this.save(true);
    }

    save(as: boolean): void {

        if (this.path == null || as) {

            const {dialog} = require('electron').remote;

            interface DialogResult {
                canceled: boolean,
                filePath: string,
                bookmark: string
            }

            let promise: Promise<DialogResult> = dialog.showSaveDialog(null, {
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

                Project.write(this);
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

    static read(path: string, onSuccess: (project: Project) => void, onError: (e: Error) => void): void {

        if (path == null) {
            throw new Error('The path provided is null or undefined.');
        }

        if (onSuccess == null) {
            throw new Error('The onSuccess(project: Project) function given is null or undefined.');
        }

        if (onError == null) {
            throw new Error('The onError(error: Error) function given is null or undefined.');
        }

        let zip = new Zip();
        zip.read(path, () => {

                let project: Project = null;

                if (!zip.exists('project.json')) {
                    let error = new Error('The project.json file is missing.');
                    onError(error);
                    throw error;
                }

                let projectJson = JSON.parse(zip.get('project.json').toString());
                if (projectJson.layers == null) {
                    let error = new Error('The project.json file is missing the \'layers\' section.');
                    onError(error);
                    throw error;
                }

                // @ts-ignore
                let renderer: MapRenderer = global.editor.renderer;
                project = new Project(renderer, projectJson.name);

                // Load metadata for the project.
                if (projectJson.metadata != null) {
                    for (let o in projectJson.metadata) {
                        let key: string = <string> o;
                        let value = projectJson.metadata[key];
                        project.setMetadata(key, value);
                    }
                }

                // Load all layers in the project.
                let layers = project.layers;
                for (let o in projectJson.layers) {

                    let id = <string> o;
                    let next = projectJson.layers[id];

                    let type = next.type;
                    if (type == null) {
                        type = 'default';
                    }

                    let layer = LayerLoader.get(type).onLoad(id, next, zip);
                    layers.add(layer);
                }

                if (onSuccess != null) {
                    onSuccess(project);
                }
            },
            (error: Error) => {
                onError(error);
            });
    }

    static write(project: Project, path: string = null): void {

        if (project == null) {
            throw new Error('The project given is null or undefined.');
        }

        if (path == null) {
            path = project.path;
        }

        if (path == null) {
            throw new Error('The path provided and the path in the project'
                + ' given are null or undefined.');
        }

        let zip = new Zip();

        let json: { [id: string]: any } = {};
        json.name = project._name;
        json.layers = {};

        let layers = project.layers.layers;
        for (let index = 0; index < layers.length; index++) {
            let next = layers[index];
            let id = next.getId();
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
        zip.write(path);
    }

    static exportLVL(project: Project, path: string): void {
        let tiles = new TileData();
        for (let x = 0; x < 1024; x++) {
            for (let y = 0; y < 1024; y++) {
                let id = project.layers.getTile(x, y);
                if (id === -1) {
                    id = 0;
                }
                tiles.set(x, y, id, null, false);
            }
        }

        let map = new LVLMap('name', tiles, project.tileset);
        LVL.write(map, path);
    }
}

/**
 * The <i>ProjectEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface ProjectEvent extends CustomEvent {
    project: Project
}
