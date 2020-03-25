import { DEFAULT_ATLAS } from '../main';
import { Editor } from './Editor';
import { Selection, SelectionGroup, SelectionSlot, SelectionType } from './ui/Selection';
import { UITab } from './ui/UI';
import { CustomEvent, CustomEventListener } from './ui/CustomEventListener';
import { ProjectAtlas } from './render/ProjectAtlas';
import { EditManager } from './EditManager';
import { LayerManager } from './layers/LayerManager';
import { MapSections } from '../util/map/MapSection';
import { LVLTileSet } from '../io/LVL';
import { LVL } from '../io/LVLUtils';
import { Background } from '../common/Background';
import { SelectionRenderer } from './render/SelectionRenderer';
import { MapRenderer } from './render/MapRenderer';

/**
 * The <i>Project</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Project extends CustomEventListener<CustomEvent> {

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

    preUpdate(): void {
        this.layers.preUpdate();
    }

    update(delta: number): void {
        this.layers.update(delta);
        this.background.update();
        this.atlas.update();
        this.selectionRenderer.update();
    }

    postUpdate(): void {
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
}

/**
 * The <i>ProjectEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface ProjectEvent extends CustomEvent {
    project: Project
}
