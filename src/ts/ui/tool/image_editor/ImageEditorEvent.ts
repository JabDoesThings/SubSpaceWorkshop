/**
 * The <i>ImageEditorEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
import ImageEditorEventType from './ImageEditorEventType';

export default interface ImageEditorEvent {
  type: ImageEditorEventType;
  data: { x: number, y: number, pressure: number };
  button: number;
  e: any;
}
