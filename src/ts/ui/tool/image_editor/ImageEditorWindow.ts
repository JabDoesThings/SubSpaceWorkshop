import ImageEditor from './ImageEditor';
import UIMenuBarItem from '../../component/UIMenuBarItem';
import { UIMenuBarItemEvent } from '../../UIEvents';
import UIMenuBarItemAction from '../../component/UIMenuBarItemAction';
import UIInnerWindow from '../../component/UIInnerWindow';

export default class ImageEditorWindow extends UIInnerWindow {

  imageEditor: ImageEditor;
  private uiImageEditorElement: HTMLDivElement;

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
    const open = new UIMenuBarItem(null, ['fas', 'fa-folder-open']);
    const save = new UIMenuBarItem(null, ['fas', 'fa-save']);
    this.menuBar.addItem(open);
    this.menuBar.addItem(save);

    open.addEventListener((event: UIMenuBarItemEvent) => {
      // TODO: Implement open image dialog. -Jab
    });

    save.addEventListener((event: UIMenuBarItemEvent) => {
      if (event.action === UIMenuBarItemAction.CLICK) {
        this.imageEditor.save();
        this.close();
      }
    });

    this.uiImageEditorElement = document.createElement('div');
    this.uiImageEditorElement.classList.add('ui-image-editor');
    this.content.appendChild(this.uiImageEditorElement);
    this.imageEditor = new ImageEditor(this.uiImageEditorElement);
    this.imageEditor.init();
  }

  /** @override */
  onOpen(): void {
  }

  /** @override */
  onClose(): void {
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
