import CustomEvent from '../../CustomEvent';
import ImageEditorAction from './ImageEditorAction';

/**
 * The <i>ImageEditorEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface ImageEditorEvent extends CustomEvent {
  action: ImageEditorAction;
  e: any;
}
