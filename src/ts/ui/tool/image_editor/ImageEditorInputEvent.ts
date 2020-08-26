import ImageEditorEventType from './ImageEditorEventType';
import CustomEvent from '../../CustomEvent';

/**
 * The <i>ImageEditorInputEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface ImageEditorInputEvent extends CustomEvent {
  type: ImageEditorEventType;
  data: { x: number, y: number, pressure: number };
  button: number;
  e: any;
}
