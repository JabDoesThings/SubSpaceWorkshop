import CustomEvent from '../../CustomEvent';
import UIPopup from './UIPopup';
import UIPopupAction from './UIPopupAction';

export default interface UIPopupEvent extends CustomEvent {
  eventType: string;
  forced: boolean;
  popup: UIPopup;
  action: UIPopupAction;
}
