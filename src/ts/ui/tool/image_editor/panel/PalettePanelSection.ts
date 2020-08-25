import EditorPanelSection from './EditorPanelSection';
import Palette from '../../../util/Palette';
import PaletteSelection from './element/PaletteSelection';

export default class PalettePanelSection extends EditorPanelSection {
  private palette: Palette;

  constructor(palette: Palette) {
    super('tile-editor-palette-panel', 'Palette');
    this.palette = palette;
    const paletteSelection = new PaletteSelection(palette);
    this.content.contents.appendChild(paletteSelection.element);
  }
}
