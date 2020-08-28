import ImageEditor from './ImageEditor';
import UIMenuBarItem from '../../component/UIMenuBarItem';
import { UIMenuBarItemEvent } from '../../UIEvents';
import UIMenuBarItemAction from '../../component/UIMenuBarItemAction';
import UIInnerWindow from '../../component/frame/UIInnerWindow';
import ImageEditorEvent from './ImageEditorEvent';
import ImageEditorAction from './ImageEditorAction';
import KeyDownEvent = JQuery.KeyDownEvent;

/**
 * The <i>ImageEditorWindow</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ImageEditorWindow extends UIInnerWindow {

  imageEditor: ImageEditor;
  private uiImageEditorElement: HTMLDivElement;
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
    super(element);
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

    // this.uiImageEditorElement = document.createElement('div');
    // this.uiImageEditorElement.classList.add('ui-image-editor');
    // this.content.appendChild(this.uiImageEditorElement);
    this.imageEditor = new ImageEditor(this.content);
    this.imageEditor.init();

    this.openIcon.addEventListener((event: UIMenuBarItemEvent) => {
      // TODO: Implement open image dialog. -Jab
    });

    this.saveIcon.addEventListener((event: UIMenuBarItemEvent) => {
      if (event.action === UIMenuBarItemAction.CLICK) {
        this.imageEditor.save();
        this.close();
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
  }

  /** @override */
  onOpen(): void {
  }

  /** @override */
  onClose(): void {
    this._checkUndoRedo();
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

  editImage(
    source: HTMLCanvasElement, dim: number[], onSave: (source: HTMLCanvasElement) => void, onCancel: () => void) {
    this.imageEditor.editImage(source, dim, onSave, onCancel);
    this.open();
  }

  private static createWindow(id: string, title: string): HTMLElement {
    // Window title.
    const windowTitle = document.createElement('div');
    windowTitle.classList.add('window-title');
    const titleLabel = document.createElement('label');
    titleLabel.innerText = title;
    windowTitle.appendChild(titleLabel);
    // Menu bar.
    const menuBar = document.createElement('div');
    menuBar.classList.add('menu-bar');
    // Content.
    const content = document.createElement('div');
    content.classList.add('content');
    content.style.padding = '0 0 0 0';
    // Main window.
    const innerWindow = document.createElement('div');
    innerWindow.id = id;
    innerWindow.classList.add('ui-inner-window');
    innerWindow.appendChild(windowTitle);
    innerWindow.appendChild(menuBar);
    innerWindow.appendChild(content);
    return innerWindow;
  }
}
