import LayerLoader from './LayerLoader';
import { Zip } from '../../io/Zip';
import Layer from './Layer';

/**
 * The <i>DefaultLayerLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class DefaultLayerLoader extends LayerLoader {

  /** @override */
  onLoad(id: string, json: { [p: string]: any }, projectZip: Zip): Layer {
    console.log(`# Reading layer: ${json.name} (${id})`);
    let layer = new Layer(json.type, id, json.name);
    layer.load(json, projectZip);
    return layer;
  }
}

LayerLoader.set('default', new DefaultLayerLoader());
