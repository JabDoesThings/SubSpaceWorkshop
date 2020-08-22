import MapMouseEventType from './MapMouseEventType';
import MapSpace from './MapSpace';

/**
 * The <i>MapMouseEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
interface MapMouseEvent {
  type: MapMouseEventType;
  data: MapSpace;
  button: number;
  e: MouseEvent;
}

export default MapMouseEvent;
