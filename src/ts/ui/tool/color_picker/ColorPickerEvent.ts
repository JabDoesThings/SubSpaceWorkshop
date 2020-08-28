import CustomEvent from '../../CustomEvent';
import ColorPickerAction from './ColorPickerAction';
import ColorPicker from './ColorPicker';

/**
 * The <i>ColorPickerEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface ColorPickerEvent extends CustomEvent {
  forced: boolean;
  eventType: string;
  action: ColorPickerAction;
  data: any | null;
  popup: ColorPicker;
}
