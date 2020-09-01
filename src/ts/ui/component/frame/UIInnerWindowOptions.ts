import { Anchor } from '../../UIProperties';
import WindowDimensions from './WindowDimensions';

export default interface UIInnerWindowOptions {
  canMinimize: boolean;
  canResize: boolean;
  canClose: boolean;
  anchor: Anchor;
  dimensions: WindowDimensions;
}
