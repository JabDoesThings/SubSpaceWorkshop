import { CustomEventListener } from '../ui/UI';
import Editor from './Editor';
import MenuEvent from './MenuEvent';

export default class MenuManager extends CustomEventListener<MenuEvent> {
  editor: Editor;

  /** @param {Editor} editor */
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
