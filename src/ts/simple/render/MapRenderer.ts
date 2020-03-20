import { MapGrid } from './MapGrid';
import { MapRadar } from './MapRadar';
import { PalettePanel } from '../ui/PalettePanel';
import { MapMouseEvent, MapMouseEventType, Renderer } from '../../common/Renderer';
import { Radar } from '../../common/Radar';
import { PathMode } from '../../util/Path';
import { Session } from '../Session';
import { CompiledLVZMapObject, CompiledLVZScreenObject, LVZPackage, LVZXType, LVZYType } from '../../io/LVZ';
import {
    IconToolbarAction,
    PanelOrientation,
    TabOrientation,
    TabPanelAction,
    ToolbarOrientation,
    UIIcon,
    UIIconToolbar,
    UIIconToolbarEvent,
    UIPanel,
    UIPanelSection,
    UITool,
    UITooltip
} from '../ui/UI';
import { CustomEvent, CustomEventListener } from '../ui/CustomEventListener';
import { MapSprite } from './MapSprite';
import * as PIXI from "pixi.js";
import { ToolManager } from '../ToolManager';

/**
 * The <i>MapRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapRenderer extends Renderer {

    readonly layers: LayerCluster;
    readonly mapLayers: LayerCluster;
    readonly screenLayers: LayerCluster;

    grid: MapGrid;
    session: Session;
    radar: Radar;
    tab: HTMLDivElement;
    toolbarLeft: UIIconToolbar;
    leftPanel: UIPanel;
    rightPanel: UIPanel;
    mapObjectSection: UIMapObjectSection;
    paletteTab: PalettePanel;

    screen: ScreenManager;
    toolManager: ToolManager;

    /**
     * Main constructor.
     */
    public constructor() {

        super();

        this.radar = new MapRadar(this);

        this.layers = new LayerCluster();
        this.mapLayers = new LayerCluster();
        this.screenLayers = new LayerCluster();
        this.screen = new ScreenManager(this);

        let leftOpen = false;
        let rightOpen = false;
        let width = 320;

        let viewport = <HTMLDivElement> document.getElementsByClassName('viewport').item(0);

        let updateViewport = (): void => {
            if (leftOpen && rightOpen) {
                viewport.style.left = (4 + width) + 'px';
                viewport.style.width = 'calc(100% - ' + (width * 2) + 'px)';
            } else if (leftOpen) {
                viewport.style.left = (4 + width) + 'px';
                viewport.style.width = 'calc(100% - ' + width + 'px)';
            } else if (rightOpen) {
                viewport.style.left = '4px';
                viewport.style.width = 'calc(100% - ' + width + 'px)';
            } else {
                viewport.style.left = '4px';
                viewport.style.width = '100%';
            }
        };

        this.leftPanel = new UIPanel(
            'left-panel',
            'editor-left-tab-menu',
            PanelOrientation.LEFT,
            TabOrientation.LEFT, width
        );

        this.leftPanel.createPanel('tab-1-panel-tab', 'Tab 1');
        this.leftPanel.createPanel('tab-2-panel-tab', 'Tab 2');

        this.rightPanel = new UIPanel(
            'right-panel',
            'editor-right-tab-menu',
            PanelOrientation.RIGHT,
            TabOrientation.RIGHT, width
        );

        this.paletteTab = new PalettePanel(this);
        this.rightPanel.add(this.paletteTab, 'Palette');

        let objectsTab = this.rightPanel.createPanel('objects', 'Objects');

        this.mapObjectSection = new UIMapObjectSection('map-objects', 'Map Objects');

        objectsTab.add(this.mapObjectSection);

        let container = <HTMLDivElement> document.getElementById('viewport-container');
        container.appendChild(this.leftPanel.element);
        container.appendChild(this.rightPanel.element);

        this.leftPanel.addEventListener((event) => {
            if (event.action == TabPanelAction.DESELECT) {
                leftOpen = false;
            } else if (event.action == TabPanelAction.SELECT) {
                leftOpen = true;
            }
            updateViewport();
        });

        this.rightPanel.addEventListener((event) => {
            if (event.action == TabPanelAction.DESELECT) {
                rightOpen = false;
            } else if (event.action == TabPanelAction.SELECT) {
                rightOpen = true;
            }
            updateViewport();
        });

        this.paletteTab.openAllSections();
        this.rightPanel.select(this.paletteTab);

        let toolPencil = new UITool('pencil', new UIIcon(['fas', 'fa-pencil-alt']), new UITooltip('Pencil'));
        let toolEraser = new UITool('eraser', new UIIcon(['fas', 'fa-eraser']), new UITooltip('Eraser'));
        let toolLine = new UITool('line', new UIIcon(['fas', 'fa-slash']), new UITooltip('Line'));
        let toolSquare = new UITool('square', new UIIcon(['fas', 'fa-square']), new UITooltip('Square'));
        let toolCircle = new UITool('circle', new UIIcon(['fas', 'fa-circle']), new UITooltip('Circle'));

        this.toolbarLeft = new UIIconToolbar(ToolbarOrientation.LEFT);
        this.toolbarLeft.add(toolPencil);
        this.toolbarLeft.add(toolEraser);
        this.toolbarLeft.add(toolLine);
        this.toolbarLeft.add(toolSquare);
        this.toolbarLeft.add(toolCircle);
        this.toolbarLeft.addEventListener((event: UIIconToolbarEvent) => {

            if (event.action !== IconToolbarAction.SET_ACTIVE) {
                return;
            }

            let tool = event.tool;
            if(tool == null) {
                return;
            }

            this.toolManager.setActive(tool.id);
            console.log("SET TOOL: " + tool.id);
        });

        let vp = container.getElementsByClassName('viewport').item(0);
        vp.appendChild(this.toolbarLeft.element);

        updateViewport();
    }

    // @Override
    protected onInit(): void {

        this.toolManager = new ToolManager(this);

        this.grid = new MapGrid(this);
        this.grid.filters = [];
        this.grid.filterArea = this.app.renderer.screen;
        // this.grid.visible = false;

        let scales = [2, 1, 0.5, 0.25, 0.1];
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

        // this.events.addMouseListener((event: MapMouseEvent): void => {
        //
        //     if (this.session == null) {
        //         return;
        //     }
        //
        //     if (event.type !== MapMouseEventType.DOWN) {
        //         return;
        //     }
        //
        //     let selectionGroup = this.session.selectionGroup;
        //
        //     let selection: Selection = null;
        //     if (event.button == 0) {
        //         selection = selectionGroup.getSelection(SelectionSlot.PRIMARY);
        //     } else if (event.button == 2) {
        //         selection = selectionGroup.getSelection(SelectionSlot.SECONDARY);
        //     }
        //
        //     if (selection == null || selection.type !== SelectionType.IMAGE) {
        //         return;
        //     }
        //
        //     let split = (<string> selection.id).split('>>>');
        //     let lvzPackageName = split[0];
        //     let imageIndex = parseInt(split[1]);
        //
        //     let lvzPackage: LVZPackage;
        //
        //     let packages = this.session.lvzManager.packages;
        //     for (let index = 0; index < packages.length; index++) {
        //         let next = packages[index];
        //         if (next.name.toLowerCase() === lvzPackageName) {
        //             lvzPackage = next;
        //             break;
        //         }
        //     }
        //
        //     if (lvzPackage == null) {
        //         console.log('LVZPackage not found: ' + lvzPackageName);
        //         return;
        //     }
        //
        //     let coords = {x: event.data.tileX * 16, y: event.data.tileY * 16};
        //     lvzPackage.createMapObject(imageIndex, coords);
        //     this.session.lvzManager.setDirtyPoint(coords.x, coords.y);
        // });
        //
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

            let cpos = this.camera.position;
            let cx = cpos.x * 16;
            let cy = cpos.y * 16;
            let scale = cpos.scale;
            let invScale = 1 / scale;
            let sw = this.app.view.width * invScale;
            let sh = this.app.view.height * invScale;
            let x = (Math.floor((-1 + (-cx + sw / 2)))) * scale;
            let y = (1 + Math.floor((-cy + sh / 2))) * scale;

            for (let index = 0; index < 8; index++) {
                let next = this.mapLayers.layers[index];
                next.x = x;
                next.y = y;
                next.scale.x = scale;
                next.scale.y = scale;
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

        this.paletteTab.update();

        this.screen.update();

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

        this.app.stage.removeChildren();
        for (let index = 0; index < 8; index++) {
            this.layers.layers[index].removeChildren();
            this.mapLayers.layers[index].removeChildren();
            if (index == 2) {
                this.app.stage.addChild(this.grid);
            }
            this.app.stage.addChild(this.layers.layers[index]);
            this.app.stage.addChild(this.mapLayers.layers[index]);
            this.app.stage.addChild(this.screenLayers.layers[index]);
        }

        if (this.session == null) {
            console.log("Active session: none.");
        } else {
            session.cache.set();
            console.log("Active session: " + this.session._name);
        }

        this.screen.draw();
        this.paletteTab.draw();
        this.paletteTab.update();
        this.radar.draw().then(() => {
            this.radar.apply();
        });
    }
}

/**
 * The <i>MapObjectEntryAction</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum MapObjectEntryAction {

}

/**
 * The <i>UIMapObjectEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface UIMapObjectEvent extends CustomEvent {
    mapObjectEntry: UIMapObjectEntry,
    action: MapObjectEntryAction
}

/**
 * The <i>UIMapObjectSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIMapObjectSection extends UIPanelSection {

    readonly pkgs: LVZPackage[];
    entries: UIMapObjectEntry[];

    constructor(id: string, title: string) {

        super(id, title);

        this.pkgs = [];
        this.entries = [];
    }

    update(): void {

        if (!this.isEmpty()) {
            for (let index = 0; index < this.entries.length; index++) {
                let next = this.entries[index];
                this.element.removeChild(next.element);
            }
        }

        this.entries = [];

        if (this.pkgs.length === 0) {
            return;
        }

        for (let pkgIndex = 0; pkgIndex < this.pkgs.length; pkgIndex++) {

            let nextPkg = this.pkgs[pkgIndex];
            let mapObjects = nextPkg.mapObjects;

            for (let index = 0; index < mapObjects.length; index++) {
                let next = mapObjects[index];
                let entry = new UIMapObjectEntry(next);
                this.entries.push(entry);
            }
        }
    }

    isEmpty(): boolean {
        return this.size() !== 0;
    }

    size(): number {
        return this.entries.length;
    }

}

/**
 * The <i>UIMapObjectEntry</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIMapObjectEntry extends CustomEventListener<UIMapObjectEvent> {

    readonly object: CompiledLVZMapObject;
    readonly element: HTMLDivElement;
    private readonly nameElement: HTMLDivElement;
    private readonly nameLabelElement: HTMLLabelElement;
    private readonly imageElement: HTMLDivElement;
    private readonly coordinatesElement: HTMLDivElement;
    private readonly optionsElement: HTMLDivElement;

    /**
     * Main constructor.
     *
     * @param object
     */
    constructor(object: CompiledLVZMapObject) {

        super();

        this.object = object;

        this.nameLabelElement = document.createElement('label');

        this.nameElement = document.createElement('div');
        this.nameElement.classList.add('name');
        this.nameElement.appendChild(this.nameLabelElement);

        this.imageElement = document.createElement('div');
        this.imageElement.classList.add('image');

        this.coordinatesElement = document.createElement('div');
        this.coordinatesElement.classList.add('coordinates');

        this.optionsElement = document.createElement('div');
        this.optionsElement.classList.add('options');

        this.element = document.createElement('div');
        this.element.classList.add('map-object-entry');
        this.element.appendChild(this.nameElement);
        this.element.appendChild(this.imageElement);
        this.element.appendChild(this.coordinatesElement);
        this.element.appendChild(this.optionsElement);
    }

    update(): void {
        this.nameLabelElement.innerText = this.object.id + ' (' + this.object.pkg.name + ")";
    }

}

/**
 * The <i>LayerCluster</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LayerCluster {

    readonly layers: PIXI.Container[];

    /**
     * Main constructor.
     */
    constructor() {
        this.layers = [];
        for (let index = 0; index < 8; index++) {
            let layer = new PIXI.Container();
            layer.sortableChildren = false;
            layer.sortDirty = false;
            layer.interactive = false;
            layer.interactiveChildren = false;
            this.layers.push(layer);
        }
    }

    clear(): void {
        for (let index = 0; index < 8; index++) {
            this.layers[index].removeChildren();
        }
    }
}

export class ScreenManager {

    private renderer: MapRenderer;
    private previousScreen: PIXI.Rectangle;
    private animatedObjects: LVZScreenEntry[];

    private dirty: boolean;

    constructor(renderer: MapRenderer) {
        this.renderer = renderer;
        this.previousScreen = new PIXI.Rectangle();
        this.animatedObjects = [];
        this.dirty = true;
    }

    update(): void {

        let screen = this.renderer.app.screen;

        if (this.dirty || this.previousScreen.x !== screen.x
            || this.previousScreen.y !== screen.y
            || this.previousScreen.width !== screen.width
            || this.previousScreen.height !== screen.height) {
            this.draw();
        }

        if (this.animatedObjects.length !== 0) {
            for (let index = 0; index < this.animatedObjects.length; index++) {
                ScreenManager.drawEntry(this.animatedObjects[index]);
            }
        }
    }

    draw(): void {

        let screen = this.renderer.app.screen;
        let center = {x: screen.width / 2, y: screen.height / 2};

        let calculate = (x: number, y: number, xType: LVZXType, yType: LVZYType): { x: number, y: number } => {

            let result = {x: x, y: y};

            if (xType === LVZXType.SCREEN_CENTER) {
                result.x = x + center.x;
            } else if (xType === LVZXType.SCREEN_RIGHT) {
                result.x = x + screen.width;
            }

            if (yType === LVZYType.SCREEN_CENTER) {
                result.y = y + center.y;
            } else if (yType === LVZYType.SCREEN_BOTTOM) {
                result.y = y + screen.height;
            }

            // TODO: Implement all coordinates.

            return result;
        };

        let cluster = this.renderer.screenLayers;
        cluster.clear();

        let session = this.renderer.session;
        if (session == null) {
            return;
        }

        let atlas = session.atlas;

        let screenObjects = session.lvzManager.getScreenObjects();
        if (screenObjects.length === 0) {
            return;
        }

        for (let index = 0; index < screenObjects.length; index++) {

            let object = screenObjects[index];
            let pkg = object.pkg;
            let image = pkg.images[screenObjects[index].image];
            let packageName = screenObjects[index].pkg.name;

            let coordinates = calculate(object.x, object.y, object.xType, object.yType);

            let sprite = atlas.getSpriteById(packageName + '>>>' + object.image);
            if (sprite == null) {
                continue;
            }

            let _sprite = new PIXI.Sprite();
            _sprite.x = coordinates.x;
            _sprite.y = coordinates.y;

            let profile = <LVZScreenEntry> {
                sprite: sprite,
                _sprite: _sprite,
                object: object
            };

            ScreenManager.drawEntry(profile);

            cluster.layers[object.layer].addChild(_sprite);

            if ((image.xFrames > 1 || image.yFrames > 1) && image.animationTime !== 0) {
                this.animatedObjects.push(profile);
            } else {
                // this.objects.push(profile);
            }
        }

        this.previousScreen.x = screen.x;
        this.previousScreen.y = screen.y;
        this.previousScreen.width = screen.width;
        this.previousScreen.height = screen.height;
    }

    private static drawEntry(entry: LVZScreenEntry): void {

        if (entry.sprite == null) {
            return;
        }

        if (entry.sprite.sequence != null) {
            let offset = entry.sprite.offset;
            if (entry.sprite.sequence.length > offset) {
                entry._sprite.texture = entry.sprite.sequence[entry.sprite.offset];
            }
        }
    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }
}

export interface LVZScreenEntry {
    sprite: MapSprite,
    _sprite: PIXI.Sprite,
    object: CompiledLVZScreenObject
}
