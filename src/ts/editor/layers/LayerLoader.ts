import { Zip } from '../../io/Zip';
import Layer from './Layer';

export const loaders: { [type: string]: LayerLoader } = {};

/**
 * @param {string} type The type that the layer loader identifies as.
 *
 * @return {LayerLoader} Returns the layer loader that is identified as the given type.
 */
export const getLayerLoader = (type: string): LayerLoader => {
  return loaders[type];
};

/**
 * @param {string} type type The type that the layer loader identifies as.
 * @param {LayerLoader} loader The layer loader to set.
 */
export const setLayerLoader = (type: string, loader: LayerLoader): void => {
  loaders[type] = loader;
};

/**
 * The <i>LayerLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
export default interface LayerLoader {
  /**
   * @param {string} id
   * @param {[field: string]: any} json
   * @param {Zip} projectZip
   */
  onLoad(id: string, json: { [field: string]: any }, projectZip: Zip): Layer;
}
