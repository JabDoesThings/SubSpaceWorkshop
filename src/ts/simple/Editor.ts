import * as PIXI from "pixi.js";
import { MapRenderer } from './render/MapRenderer';
import { KeyListener } from '../util/KeyListener';
import { Project } from './Project';
import { UITabMenu } from './ui/UI';
import { CustomEventListener, CustomEvent } from './ui/CustomEventListener';
import { Layer } from './layers/Layer';
import { LVL } from '../io/LVLUtils';
import TilesetEditor from './ui/TilesetEditor';

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
  tilesetEditor: TilesetEditor;
  private _shiftListener: KeyListener;
  private _controlListener: KeyListener;
  private _altListener: KeyListener;

  menuManager: MenuManager;

  /**
   * @constructor
   *
   * @param {Project[]} projects The projects to initially load.<br/>
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
    const mapEditorTab = this.tabMenu.createTab('map_editor', 'Map', true);
    const blueprintEditorTab = this.tabMenu.createTab('blueprint_editor', 'Blueprint Editor', false);

    mapEditorTab.addEventListener(() => {
    });
    blueprintEditorTab.addEventListener(() => {
    });

    this.tabMenu.select(mapEditorTab);
    this.renderer = new MapRenderer(this);

    let vc = <HTMLDivElement> document.getElementById("viewport-container");
    vc.appendChild(this.tabMenu.element);

    let container = <HTMLDivElement> document.getElementsByClassName("viewport").item(0);
    this.renderer.init(container, 'viewport', true);

    // Screenshot button.
    new KeyListener("F12", () => {
      const renderer = this.renderer.app.renderer;
      const width = renderer.width;
      const height = renderer.height;
      const renderTexture = PIXI.RenderTexture.create({width: width, height: height});
      renderer.render(this.renderer.app.stage, renderTexture);
      const canvas = renderer.extract.canvas(renderTexture);
      const outCanvas = <HTMLCanvasElement> document.createElement('canvas');
      outCanvas.width = width;
      outCanvas.height = height;
      const ctx = outCanvas.getContext('2d');
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.drawImage(canvas, 0, 0);
      const b64 = outCanvas.toDataURL('image/png');
      const link = document.createElement("a");
      link.setAttribute("href", b64);
      link.setAttribute("download", "screenshot.png");
      link.click();
    });

    this.menuManager.addEventListener((event) => {
      if (event.menuId === 'new') {
        const project = new Project(this.renderer, 'untitled');
        const baseLayer = new Layer('default', null, 'Base Layer');
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
        const project = this.projects[this.active];
        if (project == null) {
          return;
        }
        project.save(false);
      } else if (event.menuId === 'save-as') {
        if (this.active === -1) {
          return;
        }
        const project = this.projects[this.active];
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

    this.tilesetEditor = new TilesetEditor(this);
  }

  /**
   * Adds projects to the editor.
   *
   * @param {Project[]} projects
   *
   * @return {boolean} Returns true if the action is cancelled.
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
      this.projects.push(projects[index]);
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
   * @param {Project[]} projects
   * @param {boolean} unload
   *
   * @return {boolean} Returns true if the action is cancelled.
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

    const active = this.projects[this.active];
    const toRemove: Project[] = [];

    for (let index = 0; index < projects.length; index++) {
      let next = projects[index];
      toRemove.push(next);
    }

    if (toRemove.length === 0) {
      return false;
    }

    const contains = (project: Project): boolean => {
      for (let index = 0; index < toRemove.length; index++) {
        if (toRemove[index] === project) {
          return true;
        }
      }
      return false;
    };

    const newArray: Project[] = [];
    for (let index = 0; index < this.projects.length; index++) {
      const next = this.projects[index];
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
      eventType: 'EditorProjectEvent',
      editor: this,
      action: EditorAction.PROJECT_REMOVED,
      projects: projects,
      forced: true
    });
  }

  open(path: string = null): void {
    const open = (_paths: string[]): void => {
      if (_paths == null || _paths.length === 0) {
        return;
      }
      for (let index = 0; index < _paths.length; index++) {
        Project.read(_paths[index], (project: Project) => {
          this.add([project]);
          this.setActive(this.projects.length - 1);
        }, (error: Error) => {
          throw error;
        }).then(() => {
        });
      }
    };

    if (path == null) {
      const {dialog} = require('electron').remote;

      interface DialogResult {
        canceled: boolean;
        filePaths: string[];
        bookmark: string;
      }

      const promise: Promise<DialogResult> = dialog.showOpenDialog(null, {
          title: 'Open Project',
          buttonLabel: 'Open',
          filters: [
            {name: 'SubSpace Workshop Project', extensions: ['sswp']}
          ]
        }
      );

      promise.then((result: DialogResult) => {
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

    const _import = (_path: string): void => {
      let map = LVL.read(_path);
      let addProject: boolean = false;
      if (project == null) {
        project = new Project(this.renderer, map.name);
        addProject = true;
      }

      const name = addProject ? 'Base Layer' : map.name;
      const layer = new Layer('default', null, name);
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
        canceled: boolean;
        filePaths: string[];
        bookmark: string;
      }

      const promise: Promise<DialogResult> = dialog.showOpenDialog(null, {
          title: 'Import LVL',
          buttonLabel: 'Import',
          filters: [
            {name: 'SubSpace Level Map', extensions: ['lvl']}
          ],
        }
      );

      promise.then((result: DialogResult) => {
        if (result.canceled || result.filePaths == null || result.filePaths.length === 0) {
          return;
        }
        _import(result.filePaths[0]);
      });
    } else {
      _import(path);
    }
  }

  private exportLVL(path: string = null): void {
    const project = this.projects[this.active];
    if (project == null) {
      return;
    }

    const _export = (_path: string): void => {
      Project.exportLVL(project, _path);
    };

    if (path == null) {
      const {dialog} = require('electron').remote;

      interface DialogResult {
        canceled: boolean;
        filePath: string;
        bookmark: string;
      }

      const promise: Promise<DialogResult> = dialog.showSaveDialog(null, {
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
   * @param {number} index
   *
   * @return {boolean} Returns true if the action is cancelled.
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
    // @ts-ignore
    global.activeProject = this.projects[this.active];

    if (index == -1) {
      this.tabMenu.deselect();
      this.renderer.setProject(null);
      document.title = 'SubSpace Workshop';
    } else {
      let project = this.projects[this.active];
      document.title = `SubSpace Workshop - ${project._name}`;
      this.renderer.setProject(project);
    }

    console.log(`document.title = ${document.title}`);

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

  getActiveProject() {
    if (this.active === -1) {
      return null;
    }
    return this.projects[this.active];
  }
}

export class MenuManager extends CustomEventListener<MenuEvent> {

  editor: Editor;

  /**
   * @constructor
   *
   * @param {Editor} editor
   */
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
        const menu = this.parentElement;
        for (let index = 0; index < menu.childElementCount; index++) {
          let next = menu.children.item(index);
          next.classList.remove('open');
        }
        this.classList.add('open');
      }
    });

    const ctx = this;
    $(document).on('click', '.ui-menu .menu-option', function () {
      const menuOption = <HTMLDivElement> this;
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
  menuId: string;
}

/**
 * The <i>EditorEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface EditorEvent extends CustomEvent {
  editor: Editor;
  action: EditorAction;
}

/**
 * The <i>EditorProjectEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface EditorProjectEvent extends EditorEvent {
  projects: Project[];
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
