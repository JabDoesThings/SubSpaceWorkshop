import { CustomEvent } from '../../ui/UI';
import IconToolbarEventType from './IconToolbarEventType';
import IconTool from './IconTool';

export default interface IconToolbarEvent extends CustomEvent {
  eventType: string;
  forced: boolean;
  tool: IconTool;
  type: IconToolbarEventType;
}
