import ImageEditorWindow from '../../ui/tool/image_editor/ImageEditorWindow';

export default class TileEditor extends ImageEditorWindow {

  constructor() {
    const viewport = <HTMLElement> document.getElementsByClassName('viewport').item(0);
    console.log(viewport);
    super('tile-editor', 'Tile Editor', viewport);
  }
}
