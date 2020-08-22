import { CustomEvent } from '../ui/UI';
import { LVZPackage } from '../io/LVZ';
import { LVZAction } from './LVZAction';

export default interface LVZEvent extends CustomEvent {
  packages: LVZPackage[];
  action: LVZAction;
}
