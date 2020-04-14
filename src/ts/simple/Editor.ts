import { MapRenderer } from './render/MapRenderer';
import { KeyListener } from '../util/KeyListener';
import { Project } from './Project';
import { TabAction, UITabEvent, UITabMenu } from './ui/UI';
import { CustomEventListener, CustomEvent } from './ui/CustomEventListener';
import * as PIXI from "pixi.js";
import { Layer } from './layers/Layer';
import { ProjectUtils } from '../io/ProjectUtils';
import { LVL } from '../io/LVLUtils';

/**
 * The <i>Editor</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Editor extends CustomEventListener<EditorEvent> {

    projects: Project[];
    renderer: MapRenderer;
    tabMenu: UITabMenu;
    active: number;

    private _shiftListener: KeyListener;
    private _controlListener: KeyListener;
    private _altListener: KeyListener;

    menuManager: MenuManager;

    /**
     * Main constructor.
     *
     * @param projects The projects to initially load.<br/>
     *     <b>NOTE</b>: The last project will be set active.
     */
    constructor(...projects: Project[]) {

        super();

        // @ts-ignore
        global.editor = this;

        this.projects = [];

        this.menuManager = new MenuManager(this);

        this._altListener = new KeyListener('alt');
        this._controlListener = new KeyListener('control');
        this._shiftListener = new KeyListener('shift');

        this.tabMenu = new UITabMenu();
        for (let index = 0; index < projects.length; index++) {

            let next = projects[index];
            next.tab = this.tabMenu.createTab(next._name, next._name);

            const _i = index;
            next.tab.addEventListener((event: UITabEvent) => {
                if (event.action == TabAction.SELECT) {
                    this.setActive(_i);
                }
            });
        }

        this.renderer = new MapRenderer(this);

        let vc = <HTMLDivElement> document.getElementById("viewport-container");
        vc.appendChild(this.tabMenu.element);

        let container = <HTMLDivElement> document.getElementsByClassName("viewport").item(0);
        this.renderer.init(container, 'viewport', true);

        // Screenshot button.
        new KeyListener("F12", () => {
            let renderer = this.renderer.app.renderer;
            let width = renderer.width;
            let height = renderer.height;
            let renderTexture = PIXI.RenderTexture.create({width: width, height: height});
            renderer.render(this.renderer.app.stage, renderTexture);
            let canvas = renderer.extract.canvas(renderTexture);
            let outCanvas = <HTMLCanvasElement> document.createElement('canvas');
            outCanvas.width = width;
            outCanvas.height = height;
            let ctx = outCanvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.drawImage(canvas, 0, 0);
            let b64 = outCanvas.toDataURL('image/png');
            let link = document.createElement("a");
            link.setAttribute("href", b64);
            link.setAttribute("download", "screenshot.png");
            link.click();
        });

        this.menuManager.addEventListener((event) => {

            console.log('menu-id: ' + event.menuId);

            if (event.menuId === 'new') {

                let project = new Project(this.renderer, 'untitled');

                // let map = LVL.read('assets/lvl/zone66.lvl');
                // project.setTileset(map.tileset);
                // project.atlas.getTextureAtlas('tiles').setTexture(map.tileset.texture);

                let baseLayer = new Layer(project.layers, null, 'Base Layer');
                project.layers.add(baseLayer);

                this.add([project]);
                this.setActive(this.projects.length - 1);
                this.renderer.paletteTab.draw();
            } else if (event.menuId === 'open') {
                this.open();
            } else if (event.menuId === 'save') {

                if (this.active === -1) {
                    return;
                }

                let project = this.projects[this.active];
                if (project == null) {
                    return;
                }

                project.save(false);

            } else if (event.menuId === 'save-as') {

                if (this.active === -1) {
                    return;
                }

                let project = this.projects[this.active];
                if (project == null) {
                    return;
                }

                project.save(true);

            } else if (event.menuId === 'import-lvl') {
                this.importLVL();
            } else if (event.menuId === 'export-lvl') {
                this.exportLVL();
            }

        });

        this.add(projects);
        this.setActive(this.projects.length - 1);
    }

    /**
     * Adds projects to the editor.
     *
     * @param projects
     *
     * @return Returns true if the action is cancelled.
     */
    add(projects: Project[]): boolean {

        if (this.dispatch(<EditorProjectEvent> {
            eventType: "EditorProjectEvent",
            editor: this,
            action: EditorAction.PROJECT_ADD,
            projects: projects,
            forced: false
        })) {
            return true;
        }

        for (let index = 0; index < projects.length; index++) {
            let next = projects[index];
            this.projects.push(next);
            next.tab = this.tabMenu.createTab(next._name, next._name);

            const _i = this.projects.length - 1;
            next.tab.addEventListener((event: UITabEvent) => {
                if (event.action == TabAction.SELECT) {
                    this.setActive(_i);
                }
            });
        }

        this.dispatch(<EditorProjectEvent> {
            eventType: "EditorProjectEvent",
            editor: this,
            action: EditorAction.PROJECT_ADDED,
            projects: projects,
            forced: true
        });
    }

    /**
     * Removes projects from the editor.
     *
     * @param projects
     * @param unload
     *
     * @return Returns true if the action is cancelled.
     */
    remove(projects: Project[], unload: boolean = true): boolean {

        if (this.projects.length === 0) {
            return false;
        }

        if (this.dispatch(<EditorProjectEvent> {
            eventType: "EditorProjectEvent",
            editor: this,
            action: EditorAction.PROJECT_REMOVE,
            projects: projects,
            forced: false
        })) {
            return true;
        }

        let active = this.projects[this.active];

        let toRemove: Project[] = [];

        for (let index = 0; index < projects.length; index++) {

            let next = projects[index];

            // if (unload && next.unload()) {
            //     continue;
            // }

            toRemove.push(next);
        }

        if (toRemove.length === 0) {
            return false;
        }

        let contains = (project: Project): boolean => {
            for (let index = 0; index < toRemove.length; index++) {
                if (toRemove[index] === project) {
                    return true;
                }
            }
            return false;
        };

        let newArray: Project[] = [];

        for (let index = 0; index < this.projects.length; index++) {
            let next = this.projects[index];
            if (contains(next)) {
                continue;
            }
            newArray.push(next);
        }

        this.projects = newArray;

        // Make sure to adjust the active index to the project that was active before the removal.
        let foundActive = false;
        for (let index = 0; index < this.projects.length; index++) {
            if (this.projects[index] === active) {
                this.active = index;
                foundActive = true;
                break;
            }
        }

        // If the project is removed, set the last project active.
        if (!foundActive) {
            this.setActive(this.projects.length - 1);
        }

        this.dispatch(<EditorProjectEvent> {
            eventType: "EditorProjectEvent",
            editor: this,
            action: EditorAction.PROJECT_REMOVED,
            projects: projects,
            forced: true
        });
    }

    open(path: string = null): void {

        let open = (_paths: string[]): void => {

            if (_paths == null || _paths.length === 0) {
                return;
            }

            for (let index = 0; index < _paths.length; index++) {
                ProjectUtils.read(_paths[index], (project: Project) => {
                    this.add([project]);
                    this.setActive(this.projects.length - 1);
                });
            }
        };

        if (path == null) {

            const {dialog} = require('electron').remote;

            interface DialogResult {
                canceled: boolean,
                filePaths: string[],
                bookmark: string
            }

            let promise: Promise<DialogResult> = dialog.showOpenDialog(null, {
                    title: 'Open Project',
                    buttonLabel: 'Open',
                    filters: [
                        {name: 'SubSpace Workshop Project', extensions: ['sswp']}
                    ]
                }
            );

            promise.then((result: DialogResult) => {

                console.log(result);

                if (result.canceled || result.filePaths == null || result.filePaths.length === 0) {
                    return;
                }

                open(result.filePaths);
            });
        } else {
            open([path]);
        }
    }

    private importLVL(path: string = null): void {
        let project = this.projects[this.active];

        let _import = (_path: string): void => {

            let map = LVL.read(_path);

            let addProject: boolean = false;
            if (project == null) {
                project = new Project(this.renderer, map.name);
                addProject = true;
            }

            let name = addProject ? 'Base Layer' : map.name;
            let layer = new Layer(project.layers, null, name);
            layer.tiles = map.tiles;
            layer.tiles.setDirty(true);
            project.setTileset(map.tileset);

            project.layers.add(layer, true);

            if (addProject) {
                this.add([project]);
                this.setActive(this.projects.length - 1);
            }

        };

        if (path == null) {
            const {dialog} = require('electron').remote;

            interface DialogResult {
                canceled: boolean,
                filePaths: string[],
                bookmark: string
            }

            let promise: Promise<DialogResult> = dialog.showOpenDialog(null, {
                    title: 'Import LVL',
                    buttonLabel: 'Import',
                    filters: [
                        {name: 'SubSpace Level Map', extensions: ['lvl']}
                    ],
                }
            );

            promise.then((result: DialogResult) => {

                console.log(result);

                if (result.canceled || result.filePaths == null || result.filePaths.length === 0) {
                    return;
                }

                _import(result.filePaths[0]);
            });

            // let promise: Promise<DialogResult> = dialog.showOpenDialog(null, {
            //         title: 'Import LVL',
            //         buttonLabel: 'Import',
            //         filters: [
            //             {name: 'SubSpace Level Map', extensions: ['lvl']}
            //         ],
            //         properties: {
            //             dontAddToRecent: true
            //         }
            //     }
            // );
            //
            // promise.then((result: DialogResult) => {
            //
            //     if (result.canceled || result.filePath == null) {
            //         return;
            //     }
            //
            //     // Ensure the file-name ends with the extension.
            //     let path = result.filePath;
            //     if (!path.toLowerCase().endsWith('.lvl')) {
            //         path += '.lvl';
            //     }
            //
            //     _import(path);
            // });
        } else {
            _import(path);
        }
    }

    private exportLVL(path: string = null): void {

        let project = this.projects[this.active];
        if (project == null) {
            return;
        }

        let _export = (_path: string): void => {
            ProjectUtils.export(project, _path);
        };

        if (path == null) {

            const {dialog} = require('electron').remote;

            interface DialogResult {
                canceled: boolean,
                filePath: string,
                bookmark: string
            }

            let promise: Promise<DialogResult> = dialog.showSaveDialog(null, {
                    title: 'Export LVL',
                    buttonLabel: 'Export',
                    filters: [
                        {name: 'SubSpace Level Map', extensions: ['lvl']}
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
                if (!path.toLowerCase().endsWith('.lvl')) {
                    path += '.lvl';
                }

                _export(path);
            });
        } else {
            _export(path);
        }
    }

    /**
     *
     * @param index
     *
     * @return Returns true if the action is cancelled.
     */
    setActive(index: number): boolean {

        if (this.dispatch(<EditorProjectEvent> {
            eventType: "EditorProjectEvent",
            editor: this,
            action: EditorAction.PROJECT_ACTIVATE,
            forced: false,
            projects: [this.projects[index]]
        })) {
            return true;
        }

        this.active = index;

        if (index == -1) {
            this.tabMenu.deselect();
            this.renderer.setProject(null);
        } else {
            let project = this.projects[this.active];

            this.renderer.setProject(project);
        }

        this.dispatch(<EditorProjectEvent> {
            eventType: "EditorProjectEvent",
            editor: this,
            action: EditorAction.PROJECT_ACTIVATED,
            forced: true,
            projects: [this.projects[index]]
        });
    }

    isShiftPressed(): boolean {
        return this._shiftListener.isDown;
    }

    isControlPressed(): boolean {
        return this._controlListener.isDown;
    }

    isAltPressed(): boolean {
        return this._altListener.isDown;
    }
}

export class MenuManager extends CustomEventListener<MenuEvent> {

    editor: Editor;

    constructor(editor: Editor) {

        super();

        this.editor = editor;

        $(document).on('click', '.menu-section', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
        });

        $(document).on('click', '.ui-menu', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (this.classList.contains('open')) {
                this.classList.remove('open');
            } else {
                let menu = this.parentElement;
                for (let index = 0; index < menu.childElementCount; index++) {
                    let next = menu.children.item(index);
                    next.classList.remove('open');
                }

                this.classList.add('open');
            }
        });

        let ctx = this;
        $(document).on('click', '.ui-menu .menu-option', function (event) {
            let menuOption = <HTMLDivElement> this;
            ctx.dispatch(<MenuEvent> {
                eventType: 'MenuEvent',
                menuId: menuOption.getAttribute('menu-id'),
                forced: false
            });
        });

        $(document).on('click', () => {
            $('.ui-menu').removeClass('open');
        });
    }

}

export interface MenuEvent extends CustomEvent {
    menuId: string
}

/**
 * The <i>EditorEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface EditorEvent extends CustomEvent {
    editor: Editor,
    action: EditorAction
}

/**
 * The <i>EditorProjectEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface EditorProjectEvent extends EditorEvent {
    projects: Project[]
}

/**
 * The <i>EditorAction</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum EditorAction {
    PROJECT_ACTIVATE = 'project-activate',
    PROJECT_ACTIVATED = 'project-activated',
    PROJECT_ADD = 'project-add',
    PROJECT_ADDED = 'project-added',
    PROJECT_REMOVE = 'project-remove',
    PROJECT_REMOVED = 'project-removed'
}


