import { SectionElementEvent } from './SectionElementEvent';
import Slider from './Slider';
import SliderAction from './SliderAction';

export default interface SliderEvent extends SectionElementEvent {
  element: Slider;
  action: SliderAction;
}
