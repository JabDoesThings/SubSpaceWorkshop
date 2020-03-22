import { DEFAULT_ATLAS } from '../main';
import { LVLMap } from '../io/LVL';
import { LVL } from '../io/LVLUtils';
import { SimpleEditor } from './SimpleEditor';
import { Selection, SelectionGroup, SelectionSlot, SelectionType } from './ui/Selection';
import { UITab } from './ui/UI';
import { CustomEvent, CustomEventListener } from './ui/CustomEventListener';
import { LVZManager } from './LVZManager';
import { SessionAtlas } from './render/SessionAtlas';
import { EditManager } from './EditManager';
import { SessionCache } from './SessionCache';

/**
 * The <i>Session</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Session extends CustomEventListener<CustomEvent> {

    editor: SimpleEditor;
    editManager: EditManager;
    lvzManager: LVZManager;
    selectionGroup: SelectionGroup;
    cache: SessionCache;
    tab: UITab;
    map: LVLMap;
    atlas: SessionAtlas;
    lvzPaths: string[];
    lvlPath: string;
    _name: string;
    loaded: boolean;

    /**
     * Main constructor.
     *
     * @param lvlPath The path of the map to load.
     * @param lvzPaths The path of the LVZ files to load.
     */
    constructor(lvlPath: string, lvzPaths: string[] = []) {

        super();

        let split = lvlPath.split("/");
        this._name = split[split.length - 1].split('.')[0];

        this.editManager = new EditManager(this);
        this.lvzManager = new LVZManager(this);

        this.lvlPath = lvlPath;
        this.lvzPaths = lvzPaths;

        this.selectionGroup = new SelectionGroup();
        this.selectionGroup.setSelection(SelectionSlot.PRIMARY, new Selection(SelectionType.TILE, 1));
        this.selectionGroup.setSelection(SelectionSlot.SECONDARY, new Selection(SelectionType.TILE, 2));

        this.atlas = DEFAULT_ATLAS.clone();
        this.atlas.addEventListener((event) => {
            this.dispatch(event);
        });

        this.cache = new SessionCache(this);
    }

    /**
     * Loads map data and LVZ packages in the Session.
     *
     * @param override If true, the session will load. (Even if already loaded)
     *
     * @return Returns true if the action is cancelled.
     */
    load(override: boolean = false): boolean {

        // Make sure that the Session is only loading data when it has to.
        if (!override && this.loaded) {
            return true;
        }

        if (this.loaded) {
            this.unload(true);
        }

        if (this.dispatch(<SessionEvent> {
            eventType: 'SessionEvent',
            session: this,
            action: SessionAction.PRE_LOAD,
            forced: override
        })) {
            return true;
        }

        this.map = LVL.read(this.lvlPath);

        this.atlas.getTextureAtlas('tiles').setTexture(this.map.tileset.texture);
        this.lvzManager.load(this.lvzPaths);

        this.loaded = true;

        this.dispatch(<SessionEvent> {
            eventType: 'SessionEvent',
            session: this,
            action: SessionAction.POST_LOAD,
            forced: true
        });
    }

    /**
     * Unloads map data and LVZ packages in the Session.
     *
     * @param override If true, the session will unload. (Even if already loaded)
     *
     * @return Returns true if the action is cancelled.
     */
    unload(override: boolean = false): boolean {

        // Make sure that the Session is only unloading data when it has to.
        if (!override && !this.loaded) {
            return true;
        }

        if (this.dispatch(<SessionEvent> {
            eventType: 'SessionEvent',
            session: this,
            action: SessionAction.PRE_UNLOAD,
            forced: override
        })) {
            return true;
        }

        let tileset = this.map.tileset;
        if (tileset != null && tileset !== LVL.DEFAULT_TILESET) {
            tileset.texture.destroy(true);
        }

        this.lvzManager.unload();
        this.loaded = false;

        this.dispatch(<SessionEvent> {
            eventType: 'SessionEvent',
            session: this,
            action: SessionAction.POST_UNLOAD,
            forced: true
        });
        return false;
    }

    onPreUpdate(): void {

        if (this.lvzManager.dirty) {
            for (let y = 0; y < 16; y++) {
                for (let x = 0; x < 16; x++) {
                    let chunk = this.cache.lvzChunks[x][y];
                    if (this.lvzManager.isDirty(
                        x * 1024,
                        y * 1024,
                        (x + 1) * 1024,
                        (y + 1) * 1024
                    )) {
                        chunk.build(this, this.editor.renderer.mapLayers);
                    }
                }
            }
        }

        this.cache.onPreUpdate();
    }

    onUpdate(): void {
        this.atlas.update();
    }

    onPostUpdate(): void {
        this.selectionGroup.setDirty(false);
        this.lvzManager.onPostUpdate();
        this.atlas.setDirty(false);
        this.editor.renderer.camera.setDirty(false);
        this.map.setDirty(false);
        this.map.selections.setDirty(false);
        if (this.map.tileset != null) {
            this.map.tileset.setDirty(false);
        }
    }
}

/**
 * The <i>SessionEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface SessionEvent extends CustomEvent {
    session: Session,
    action: SessionAction
}

/**
 * The <i>SessionAction</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum SessionAction {
    PRE_LOAD = 'pre-load',
    POST_LOAD = 'post-load',
    PRE_SAVE = 'pre-save',
    POST_SAVE = 'post-save',
    PRE_UNLOAD = 'pre-unload',
    POST_UNLOAD = 'post-unload'
}
