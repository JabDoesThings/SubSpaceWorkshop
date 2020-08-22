import { Zip } from '../../io/Zip';
import Layer from './Layer';

/**
 * The <i>LayerLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class LayerLoader {
  static readonly loaders: { [type: string]: LayerLoader } = {};

  /**
   * @param {string} id
   * @param {[field: string]: any} json
   * @param {Zip} projectZip
   */
  abstract onLoad(id: string, json: { [field: string]: any }, projectZip: Zip): Layer;

  /**
   * @param {string} type The type that the layer loader identifies as.
   *
   * @return {LayerLoader} Returns the layer loader that is identified as the given type.
   */
  static get(type: string): LayerLoader {
    return LayerLoader.loaders[type];
  }

  /**
   * @param {string} type type The type that the layer loader identifies as.
   * @param {LayerLoader} loader The layer loader to set.
   */
  static set(type: string, loader: LayerLoader): void {
    LayerLoader.loaders[type] = loader;
  }
}
