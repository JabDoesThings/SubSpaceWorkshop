import ImageEditor from './ImageEditor';
import UIMenuBarItem from '../../component/UIMenuBarItem';
import { UIMenuBarItemEvent } from '../../UIEvents';
import UIMenuBarItemAction from '../../component/UIMenuBarItemAction';
import UIInnerWindow from '../../component/frame/UIInnerWindow';
import ImageEditorEvent from './ImageEditorEvent';
import ImageEditorAction from './ImageEditorAction';
import { Anchor } from '../../UIProperties';
import KeyDownEvent = JQuery.KeyDownEvent;
import WindowDimensions from '../../component/frame/WindowDimensions';

/**
 * The <i>ImageEditorWindow</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ImageEditorWindow extends UIInnerWindow {

  imageEditor: ImageEditor;
  private openIcon: UIMenuBarItem;
  private saveIcon: UIMenuBarItem;
  private undoIcon: UIMenuBarItem;
  private redoIcon: UIMenuBarItem;

  /**
   *
   * @param {HTMLElement | string} elementOrId
   * @param {string} title
   * @param {HTMLElement?} parentElement
   */
  constructor(elementOrId: HTMLElement | string, title: string = 'Image Editor', parentElement?: HTMLElement) {
    let element;
    if (typeof elementOrId === 'string') {
      const id = elementOrId;
      // Check if the element exists with the ID.
      element = document.getElementById(id);
      // If the element is not currently in the DOM, create a window and attach to the parent element.
      if (!element) {
        if (!parentElement) {
          throw new Error('The parent to append the window to is undefined.');
        }
        // Create the window and attach it to the parent element.
        element = ImageEditorWindow.createWindow(id, title);
        parentElement.appendChild(element);
      }
    } else {
      element = elementOrId;
    }
    super(element, {
      canClose: true,
      canResize: true,
      canMinimize: false,
      dimensions: new WindowDimensions({
          x: 0,
          y: 0,
          width: 800,
          height: 600
        },
        {
          width: 400,
          height: 300
        }),
      anchor: Anchor.CENTER
    });
  }

  /** @override */
  onInit(): void {
    this.openIcon = new UIMenuBarItem(null, ['fas', 'fa-folder-open']);
    this.saveIcon = new UIMenuBarItem(null, ['fas', 'fa-save']);
    this.undoIcon = new UIMenuBarItem(null, ['fas', 'fa-undo-alt']);
    this.redoIcon = new UIMenuBarItem(null, ['fas', 'fa-redo-alt']);
    this.menuBar.addItem(this.openIcon);
    this.menuBar.addItem(this.saveIcon);
    this.menuBar.addSeparator();
    this.menuBar.addItem(this.undoIcon);
    this.menuBar.addItem(this.redoIcon);

    this.imageEditor = new ImageEditor(this.content);

    this.openIcon.addEventListener((event: UIMenuBarItemEvent) => {
      // TODO: Implement open image dialog. -Jab
    });

    this.saveIcon.addEventListener((event: UIMenuBarItemEvent) => {
      if (event.action === UIMenuBarItemAction.CLICK) {
        this.imageEditor.save();
        this.close(false);
      }
    });

    this.undoIcon.addEventListener((event: UIMenuBarItemEvent) => {
      if (event.action === UIMenuBarItemAction.CLICK && this.imageEditor.canUndo()) {
        this.imageEditor.undo();
      }
      this._checkUndoRedo();
    });

    this.redoIcon.addEventListener((event: UIMenuBarItemEvent) => {
      if (event.action === UIMenuBarItemAction.CLICK && this.imageEditor.canRedo()) {
        this.imageEditor.redo();
      }
      this._checkUndoRedo();
    });

    this._checkUndoRedo();

    this.imageEditor.addEventListener((event: ImageEditorEvent) => {
      if (event.action === ImageEditorAction.REDO || event.action === ImageEditorAction.UNDO || event.action == ImageEditorAction.EDIT) {
        this._checkUndoRedo();
      }
    });

    $(window).on('keydown', (event: KeyDownEvent) => {
      if (!this.enabled) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === 'z' && event.ctrlKey) {
        if (event.shiftKey) {
          this.redoIcon.click();
        } else {
          this.undoIcon.click();
        }
      }
    });

    // Keep the resize pane sized for the editor window.
    this.resizePane.style.height = 'calc(100% + 4px)';
  }

  loop(): void {
    let f: () => void;
    f = () => {
      setTimeout(() => {
        if (this.enabled) {
          this.imageEditor.updateFrame();
          f();
        }
      }, 20);
    };
    f();
  }

  /** @override */
  onOpen(): void {
    this.loop();
  }

  /** @override */
  onClose(buttonPressed: boolean): void {
    this._checkUndoRedo();
    if (buttonPressed) {
      this.imageEditor.cancel();
      this.imageEditor.editManager.clear();
    }
  }

  private _checkUndoRedo() {
    if (this.imageEditor.canUndo()) {
      if (!this.undoIcon.enabled) {
        this.undoIcon.enable();
      }
    } else {
      if (this.undoIcon.enabled) {
        this.undoIcon.disable();
      }
    }
    if (this.imageEditor.canRedo()) {
      if (!this.redoIcon.enabled) {
        this.redoIcon.enable();
      }
    } else {
      if (this.redoIcon.enabled) {
        this.redoIcon.disable();
      }
    }
  }

  /** @override */
  onMaximize(width: number, height: number): void {
    this.imageEditor.updateFrame(width, height);
  }

  /** @override */
  onRestore(width: number, height: number): void {
    this.imageEditor.updateFrame(width, height);
  }

  editImage(
    source: HTMLCanvasElement,
    dim: { x: number, y: number, w: number, h: number },
    onSave: (source: HTMLCanvasElement) => void,
    onCancel: () => void
  ) {
    this.imageEditor.editImage(source, dim, onSave, onCancel);
    this.open();
  }

  private static createWindow(id: string, title: string): HTMLElement {
    // Window title.
    const titleLabel = document.createElement('label');
    titleLabel.innerText = title;

    const minimizeButton = document.createElement('div');
    minimizeButton.classList.add('window-title-button', 'window-title-minimize-button');

    let i = document.createElement('i');
    i.classList.add('fas', 'fa-minus');
    minimizeButton.appendChild(i);

    const resizeButton = document.createElement('div');
    resizeButton.classList.add('window-title-button', 'window-title-resize-button');

    i = document.createElement('i');
    i.classList.add('far', 'fa-window-restore');
    resizeButton.appendChild(i);

    const closeButton = document.createElement('div');
    closeButton.classList.add('window-title-button', 'window-title-close-button');

    i = document.createElement('i');
    i.classList.add('fas', 'fa-times');
    closeButton.appendChild(i);

    const titleButtons = document.createElement('div');
    titleButtons.classList.add('window-title-buttons');
    titleButtons.appendChild(minimizeButton);
    titleButtons.appendChild(resizeButton);
    titleButtons.appendChild(closeButton);

    $(titleButtons).on('click mousedown mousemove mouseup', (event) => {
      event.stopPropagation();
    });

    const windowTitle = document.createElement('div');
    windowTitle.classList.add('window-title');
    windowTitle.appendChild(titleLabel);
    windowTitle.appendChild(titleButtons);

    // Menu bar.
    const menuBar = document.createElement('div');
    menuBar.classList.add('menu-bar');
    // Content.
    const content = document.createElement('div');
    content.classList.add('content');
    content.style.width = '100%';
    content.style.padding = '0 0 0 0';

    const resizePane = document.createElement('div');
    resizePane.classList.add('resize-pane');

    // Main window.
    const innerWindow = document.createElement('div');
    innerWindow.id = id;
    innerWindow.classList.add('ui-inner-window');
    innerWindow.appendChild(resizePane);
    innerWindow.appendChild(windowTitle);
    innerWindow.appendChild(menuBar);
    innerWindow.appendChild(content);
    return innerWindow;
  }
}
