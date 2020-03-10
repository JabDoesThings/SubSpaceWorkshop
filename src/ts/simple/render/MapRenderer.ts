import { MapGrid } from './MapGrid';
import { MapRadar } from './MapRadar';
import { AssetPanel } from '../ui/AssetPanel';
import { MapMouseEvent, MapMouseEventType, Renderer } from '../../common/Renderer';
import { Radar } from '../../common/Radar';
import { PathMode } from '../../util/Path';
import { Session } from '../Session';
import { Selection, SelectionSlot, SelectionType } from '../ui/Selection';
import {
    CompiledLVZImage,
    CompiledLVZMapObject,
    LVZCollection,
    LVZMapObject,
    LVZPackage,
    LVZRenderLayer
} from '../../io/LVZ';

/**
 * The <i>SimpleRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapRenderer extends Renderer {

    grid: MapGrid;
    session: Session;
    radar: Radar;
    tilesetWindow: AssetPanel;
    tab: HTMLDivElement;

    public constructor() {
        super();
        this.radar = new MapRadar(this);
    }

    // @Override
    protected onInit(): void {

        this.grid = new MapGrid(this);
        this.grid.filters = [];
        this.grid.filterArea = this.app.renderer.screen;
        // this.grid.visible = false;

        this.grid.renderChunkGrid = false;
        this.grid.renderAxisLines = false;
        this.grid.renderBaseGrid = false;

        this.tilesetWindow = new AssetPanel(this);

        let drawn = false;
        let downPrimary = false;
        let downSecondary = false;

        let scales = [
            2,
            1,
            0.5,
            0.25,
            0.1
        ];

        let scaleIndex = 1;

        this.events.addMouseListener((event: MapMouseEvent) => {

            if (event.type !== MapMouseEventType.WHEEL_UP && event.type !== MapMouseEventType.WHEEL_DOWN) {
                return;
            }

            let path = this.camera.path;
            let active = path.isActive();
            if (active && path.tick / path.ticks < 0.1) {
                return;
            }

            let sx = event.e.offsetX;
            let sy = event.e.offsetY;
            let sw = this.app.screen.width;
            let sh = this.app.screen.height;

            let mapSpace = this.camera.toMapSpace(sx, sy, sw, sh, this.camera.position.scale * 2);

            let x = mapSpace.tileX;
            let y = mapSpace.tileY;

            if (x < 0) {
                x = 0;
            } else if (x > 1023) {
                x = 1023;
            }

            if (y < 0) {
                y = 0;
            } else if (y > 1023) {
                y = 1023;
            }

            if (event.type == MapMouseEventType.WHEEL_DOWN) {
                scaleIndex++;
            } else {
                scaleIndex--;
            }

            if (scaleIndex < 0) {
                scaleIndex = 0;
            } else if (scaleIndex > scales.length - 1) {
                scaleIndex = scales.length - 1;
            }

            let ticks = active ? 20 : 30;
            this.camera.pathTo({x: x, y: y, scale: scales[scaleIndex]}, ticks, PathMode.EASE_OUT);
        });

        this.events.addMouseListener((event: MapMouseEvent): void => {

            if (this.session == null) {
                return;
            }

            if (event.type !== MapMouseEventType.DOWN) {
                return;
            }

            let selectionGroup = this.session.selectionGroup;

            let selection: Selection = null;
            if (event.button == 0) {
                selection = selectionGroup.getSelection(SelectionSlot.PRIMARY);
            } else if (event.button == 2) {
                selection = selectionGroup.getSelection(SelectionSlot.SECONDARY);
            }

            if (selection == null || selection.type !== SelectionType.IMAGE) {
                return;
            }

            let split = (<string> selection.id).split('>>>');
            let lvzPackageName = split[0];
            let imageIndex = parseInt(split[1]);

            let lvzPackage: LVZPackage;

            for (let index = 0; index < this.session.lvzPackages.length; index++) {
                let next = this.session.lvzPackages[index];
                if (next.name === lvzPackageName) {
                    lvzPackage = next;
                    break;
                }
            }

            if (lvzPackage == null) {
                return;
            }

            let coords = {x: event.data.tileX * 16, y: event.data.tileY * 16};
            lvzPackage.createMapObject(imageIndex, coords);
            this.session.setLVZPointDirty(coords.x, coords.y);
        });

        this.events.addMouseListener((event: MapMouseEvent): void => {

            if (this.session == null) {
                return;
            }

            let button = event.button;

            if (event.type === MapMouseEventType.DRAG) {
                button = downPrimary ? 0 : downSecondary ? 2 : 99;
            }

            if (event.type === MapMouseEventType.UP) {

                if (button == 0) {
                    downPrimary = false;
                } else if (button == 2) {
                    downSecondary = false;
                }

                if (drawn) {
                    this.radar.draw().then(() => {
                        this.radar.apply();
                    });
                }
                drawn = false;
            }

            if (event.type !== MapMouseEventType.DOWN && event.type !== MapMouseEventType.DRAG) {
                return;
            }

            if (event.type === MapMouseEventType.DOWN) {
                if (button == 0) {
                    downPrimary = true;
                } else if (button == 2) {
                    downSecondary = true;
                }
            }

            let data = event.data;
            let x = data.tileX;
            let y = data.tileY;

            if ((downPrimary || downSecondary) && x >= 0 && x < 1024 && y >= 0 && y < 1024) {

                let selectionGroup = this.session.selectionGroup;

                let selection: Selection = null;
                if (downPrimary) {
                    selection = selectionGroup.getSelection(SelectionSlot.PRIMARY);
                } else if (downSecondary) {
                    selection = selectionGroup.getSelection(SelectionSlot.SECONDARY);
                }

                if (selection != null && selection.type == SelectionType.TILE) {
                    let tileId: number;
                    if (typeof selection.id == 'string') {
                        tileId = parseInt(selection.id);
                    } else {
                        tileId = selection.id;
                    }
                    this.session.map.setTile(x, y, tileId);
                }

                drawn = true;
            }
        });
    }

    // @Override
    protected onPreUpdate(delta: number): void {
        if (this.session != null) {
            this.session.onPreUpdate();
        }
    }

    // @Override
    public onUpdate(delta: number): boolean {

        if (this.session == null) {
            return;
        }

        this.session.onUpdate();

        let map = this.session.map;
        let cache = this.session.cache;
        let background = cache._background;
        let border = cache._border;

        let chunks = cache.chunks;
        let lvzChunks = cache.lvzChunks;
        let regions = cache.regions;

        if (this.camera.isDirty()) {

            if (background.visible) {
                background.update();
            }

            border.update();

            if (this.grid.visible) {
                this.grid.draw();
            }
        }

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                chunks[x][y].onUpdate(delta);
                lvzChunks[x][y].onUpdate();
            }
        }

        if (regions.length != 0) {
            for (let index = 0; index < regions.length; index++) {
                regions[index].update();
            }
        }

        this.radar.update();

        if (map != null) {

            map.setDirty(false);

            if (map.tileset != null) {
                map.tileset.setDirty(false);
            }
        }

        this.tilesetWindow.update();

        return true;
    }

    // @Override
    onPostUpdate(delta: number): void {
        if (this.session != null) {
            this.session.onPostUpdate();
        }
    }

    // @Override
    public isDirty(): boolean {
        return super.isDirty() || this.camera.isDirty() || this.session.map.isDirty();
    }

    setSession(session: Session) {

        this.session = session;
        if (!this.session.cache.initialized) {
            this.session.cache.init();
        }

        if (this.session == null) {
            console.log("Active session: none.");
        } else {
            session.cache.set(this.app.stage);
            console.log("Active session: " +  this.session._name);
            console.log(session);
            session.setLVZDirty();
        }

        this.tilesetWindow.draw();
        this.tilesetWindow.update();
        this.radar.draw().then(() => {
            this.radar.apply();
        });
    }
}
