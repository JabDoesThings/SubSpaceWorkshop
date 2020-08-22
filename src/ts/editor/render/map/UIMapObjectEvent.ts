import { CustomEvent } from '../../../ui/UI';
import UIMapObjectEntry from '../MapRenderer';
import MapObjectEntryAction from './MapObjectEntryAction';

/**
 * The <i>UIMapObjectEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface UIMapObjectEvent extends CustomEvent {
  mapObjectEntry: UIMapObjectEntry;
  action: MapObjectEntryAction;
}
