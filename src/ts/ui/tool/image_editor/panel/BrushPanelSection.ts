import EditorPanelSection from './EditorPanelSection';
import Slider from './element/Slider';
import SliderEvent from './element/SliderEvent';
import SliderAction from './element/SliderAction';
import CircleBrush from '../brush/CircleBrush';
import ImageEditor from '../ImageEditor';
import CircleBrushOptions from '../brush/CircleBrushOptions';

/**
 * The <i>BrushPanelSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class BrushPanelSection extends EditorPanelSection {
  private readonly brush: CircleBrush;

  constructor(imageEditor: ImageEditor, brush: CircleBrush) {
    super('brush-panel-section', 'Brush Properties');
    this.brush = brush;

    const sizeSlider = new Slider('float-bar', 'Size', 1, 64, 4);
    const hardnessSlider = new Slider('float-bar', 'Hardness', 0, 100, 50);
    const opacitySlider = new Slider('float-bar', 'Opacity', 0, 100, 100);
    this.content.contents.appendChild(sizeSlider.element);
    this.content.contents.appendChild(hardnessSlider.element);
    this.content.contents.appendChild(opacitySlider.element);

    sizeSlider.addEventListener((event: SliderEvent) => {
      if (event.action === SliderAction.VALUE_CHANGE) {
        brush.options.size = event.data.value;
        brush.renderMouse(imageEditor.brushSourceCanvas, imageEditor.palette, 'primary');
        imageEditor.camera.projectBrush();
      }
    });

    hardnessSlider.addEventListener((event: SliderEvent) => {
      if (event.action === SliderAction.VALUE_CHANGE) {
        (<CircleBrushOptions> brush.options).hardness = event.element.floatValue;
        brush.renderMouse(imageEditor.brushSourceCanvas, imageEditor.palette, 'primary');
        imageEditor.camera.projectBrush();
      }
    });

    opacitySlider.addEventListener((event: SliderEvent) => {
      if (event.action === SliderAction.VALUE_CHANGE) {
        imageEditor.drawSourceCtx.globalAlpha = event.element.floatValue;
        brush.options.opacity = event.element.floatValue;
        brush.renderMouse(imageEditor.brushSourceCanvas, imageEditor.palette, 'primary');
        imageEditor.camera.projectBrush();
      }
    });

    sizeSlider.triggerValueEvent();
    hardnessSlider.triggerValueEvent();
    opacitySlider.triggerValueEvent();

    // sizeSlider.value = brush.options.size;
    // hardnessSlider.value = (<CircleBrushOptions> brush.options).hardness;
    // opacitySlider.value = (<CircleBrushOptions> brush.options).opacity;
  }
}
