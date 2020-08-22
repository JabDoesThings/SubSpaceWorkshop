import { LVZDisplayMode, LVZRenderLayer } from '../io/lvz/LVZProperties';

/**
 * The <i>LVZMapObjectProperties</i> interface. TODO: Documen.
 *
 * @author Jab
 */
export default interface LVZMapObjectProperties {
  x: number;
  y: number;
  id: number;
  layer: LVZRenderLayer;
  mode: LVZDisplayMode;
  time: number;
}
