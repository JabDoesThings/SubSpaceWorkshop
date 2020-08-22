import MapGrid from './MapGrid';
import PalettePanel from '../ui/PalettePanel';
import Renderer from '../../common/render/Renderer';
import Radar from '../../common/render/Radar';
import Project from '../Project';
import ToolManager from '../tools/ToolManager';
import Editor from '../Editor';
import RenderMode from './RenderMode';
import GlassBlur from './GlassBlur';
import LayersPanel from '../ui/LayersPanel';
import LayerCluster from './map/LayerCluster';
import ScreenManager from './map/ScreenManager';
import PathMode from '../../util/PathMode';
import MapMouseEventType from '../../common/MapMouseEventType';
import MapMouseEvent from '../../common/MapMouseEvent';
import {
  IconToolbarAction,
  PanelOrientation,
  TabOrientation,
  TabPanelAction,
  ToolbarOrientation,
  ToolbarSize,
  UIIcon,
  UIIconToolbar,
  UIIconToolbarEvent,
  UIPanel,
  UITool,
  UITooltip
} from '../../ui/UI';

/**
 * The <i>MapRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class MapRenderer extends Renderer {
  readonly layers: LayerCluster;
  readonly mapLayers: LayerCluster;
  readonly screenLayers: LayerCluster;

  mode: RenderMode = RenderMode.NORMAL;
  grid: MapGrid;
  project: Project;
  radar: Radar;
  tab: HTMLDivElement;
  toolbarLeft: UIIconToolbar;
  leftPanel: UIPanel;
  topRightPanel: UIPanel;
  bottomRightPanel: UIPanel;
  paletteTab: PalettePanel;
  layersTab: LayersPanel;
  screen: ScreenManager;
  toolManager: ToolManager;
  editor: Editor;
  glassBlur: GlassBlur;

  /**
   * @param {Editor} editor
   */
  public constructor(editor: Editor) {
    super();
    this.editor = editor;
    this.radar = new Radar(this);
    this.layers = new LayerCluster();
    this.mapLayers = new LayerCluster();
    this.screenLayers = new LayerCluster();
    this.screen = new ScreenManager(this);

    let leftOpen = false;
    let rightOpen = true;
    const width = 320;
    const viewport = <HTMLDivElement> document.getElementsByClassName('viewport').item(0);

    const updateViewport = (): void => {
      if (rightOpen) {
        this.topRightPanel.open();
        this.bottomRightPanel.open();
      } else {
        this.topRightPanel.close();
        this.bottomRightPanel.close();
      }
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
      TabOrientation.LEFT,
      width
    );

    this.leftPanel.createPanel('tools-panel-tab', 'Tools');
    this.leftPanel.createPanel('library-panel-tab', 'Libraries');
    this.topRightPanel = new UIPanel(
      'top-right-panel',
      'editor-top-right-tab-menu',
      PanelOrientation.RIGHT,
      TabOrientation.RIGHT,
      width,
      true,
      'top-half'
    );
    this.bottomRightPanel = new UIPanel(
      'bottom-right-panel',
      'editor-bottom-right-tab-menu',
      PanelOrientation.RIGHT,
      TabOrientation.RIGHT,
      width,
      true,
      'bottom-half'
    );
    this.paletteTab = new PalettePanel(this);
    this.layersTab = new LayersPanel(this);
    this.topRightPanel.add(this.paletteTab, 'Palette');
    this.bottomRightPanel.add(this.layersTab, 'Layers');

    const container = <HTMLDivElement> document.getElementById('viewport-container');
    container.appendChild(this.leftPanel.element);
    container.appendChild(this.topRightPanel.element);
    container.appendChild(this.bottomRightPanel.element);
    this.leftPanel.addEventListener((event) => {
      if (event.action == TabPanelAction.DESELECT) {
        leftOpen = false;
      } else if (event.action == TabPanelAction.SELECT) {
        leftOpen = true;
      }
      updateViewport();
    });
    this.topRightPanel.addEventListener((event) => {
      if (event.action == TabPanelAction.DESELECT) {
        rightOpen = false;
      } else if (event.action == TabPanelAction.SELECT) {
        rightOpen = true;
      }
      updateViewport();
    });
    this.bottomRightPanel.addEventListener((event) => {
      if (event.action == TabPanelAction.DESELECT) {
        rightOpen = false;
      } else if (event.action == TabPanelAction.SELECT) {
        rightOpen = true;
      }
      updateViewport();
    });

    this.paletteTab.openAllSections();
    this.layersTab.openAllSections();
    this.topRightPanel.select(this.paletteTab);
    this.bottomRightPanel.select(this.layersTab);

    const toolPencil = new UITool('pencil', new UIIcon(['fas', 'fa-pencil-alt']), new UITooltip('Pencil'));
    const toolEraser = new UITool('eraser', new UIIcon(['fas', 'fa-eraser']), new UITooltip('Eraser'));
    const toolLine = new UITool('line', new UIIcon(['fas', 'fa-slash']), new UITooltip('Line'));
    const toolSquare = new UITool('square', new UIIcon(['fas', 'fa-square']), new UITooltip('Square'));
    const toolCircle = new UITool('circle', new UIIcon(['fas', 'fa-circle']), new UITooltip('Circle'));
    const toolSelect = new UITool('select', new UIIcon(['fas', 'fa-expand']), new UITooltip('Select'));
    const toolMove = new UITool('move', new UIIcon(['fas', 'fa-arrows-alt']), new UITooltip('Move Selection'));

    this.toolbarLeft = new UIIconToolbar(ToolbarOrientation.LEFT, ToolbarSize.MEDIUM);
    this.toolbarLeft.add(toolPencil);
    this.toolbarLeft.add(toolEraser);
    this.toolbarLeft.add(toolLine);
    this.toolbarLeft.add(toolSquare);
    this.toolbarLeft.add(toolCircle);
    this.toolbarLeft.add(toolSelect);
    this.toolbarLeft.add(toolMove);
    this.toolbarLeft.addEventListener((event: UIIconToolbarEvent) => {
      if (event.action !== IconToolbarAction.SET_ACTIVE) {
        return;
      }
      const tool = event.tool;
      if (tool == null) {
        return;
      }
      this.toolManager.setActive(tool.id);
      console.log(`SET TOOL: ${tool.id}`);
    });

    const vp = container.getElementsByClassName('viewport').item(0);
    vp.appendChild(this.toolbarLeft.element);
    updateViewport();

    this.glassBlur = new GlassBlur(this);
  }

  /** @override */
  protected onInit(): void {
    this.toolManager = new ToolManager(this);
    this.grid = new MapGrid(this);
    this.grid.filters = [];
    this.grid.filterArea = this.app.renderer.screen;

    const scales = [2, 1, 0.5, 0.25, 0.1];
    let scaleIndex = 1;

    this.events.addMouseListener((event: MapMouseEvent) => {
      if (event.type !== MapMouseEventType.WHEEL_UP && event.type !== MapMouseEventType.WHEEL_DOWN) {
        return;
      }

      const path = this.camera.path;
      const active = path.isActive();
      if (active && path.tick / path.ticks < 0.1) {
        return;
      }

      const sx = event.e.offsetX;
      const sy = event.e.offsetY;
      const sw = this.app.screen.width;
      const sh = this.app.screen.height;

      const mapSpace = this.camera.toMapSpace(sx, sy, sw, sh, this.camera.position.scale * 2);

      let x = mapSpace.tileX;
      if (x < 0) {
        x = 0;
      } else if (x > 1023) {
        x = 1023;
      }

      let y = mapSpace.tileY;
      if (y < 0) {
        y = 0;
      } else if (y > 1023) {
        y = 1023;
      }

      if (event.type === MapMouseEventType.WHEEL_DOWN) {
        scaleIndex++;
      } else {
        scaleIndex--;
      }

      if (scaleIndex < 0) {
        scaleIndex = 0;
      } else if (scaleIndex > scales.length - 1) {
        scaleIndex = scales.length - 1;
      }

      const ticks = active ? 20 : 30;
      this.camera.pathTo({x: x, y: y, scale: scales[scaleIndex]}, ticks, PathMode.EASE_OUT);
    });
  }

  /** @override */
  protected onPreUpdate(delta: number): void {
    if (this.project != null) {
      this.project.preUpdate();
    }
  }

  /** @override */
  public onUpdate(delta: number): boolean {
    if (this.project == null) {
      return;
    }

    this.glassBlur.onUpdate();
    this.project.update(delta);
    const background = this.project.background;

    if (this.camera.isDirty()) {
      if (background.visible) {
        background.update();
      }
      if (this.grid.visible) {
        this.grid.draw();
      }
    }

    this.radar.update();
    this.paletteTab.update();
    this.screen.update();
    return true;
  }

  /** @override */
  onPostUpdate(delta: number): void {
    if (this.project != null) {
      this.project.postUpdate();
    }
  }

  /** @override */
  public isDirty(): boolean {
    return super.isDirty() || this.camera.isDirty() || this.project.layers.isDirty();
  }

  setProject(project: Project) {
    this.project = project;
    this.app.stage.removeChildren();
    if (this.project != null) {
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
    }

    if (this.project == null) {
      console.log('Active project: none.');
    } else {
      this.layers.clear();
      this.mapLayers.clear();
      this.screenLayers.clear();
      this.layersTab.clear();
      project.activate();

      console.log(`Active project: ${this.project._name}`);
    }

    this.screen.draw();
    this.paletteTab.draw();
    this.paletteTab.update();
    this.radar.setVisible(this.project != null);
    this.radar.draw().then(() => {
      this.radar.apply();
    });

    this.glassBlur.apply(this.mapLayers.layers[2]);

    this.camera.setDirty(true);
  }

  setGlassBlur(flag: boolean) {
    if (flag) {
      this.glassBlur.enable();
    } else {
      this.glassBlur.disable();
    }
  }
}
