import CustomEvent from '../../CustomEvent';
import ColorPickerAction from './ColorPickerAction';
import ColorPicker from './ColorPicker';

export default interface ColorPickerEvent extends CustomEvent {
  forced: boolean;
  eventType: string;
  action: ColorPickerAction;
  data: any | null;
  popup: ColorPicker;
}
