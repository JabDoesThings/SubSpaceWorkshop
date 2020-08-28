import { SectionElementEvent } from './SectionElementEvent';
import Slider from './Slider';
import SliderAction from './SliderAction';

/**
 * The <i>SliderEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface SliderEvent extends SectionElementEvent {
  element: Slider;
  action: SliderAction;
}
