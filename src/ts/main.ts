import Editor from './editor/Editor';
import * as PIXI from "pixi.js";
import { DEFAULT_ATLAS, DEFAULT_TEXTURES } from './editor/render/SubSpaceAtlas';
import UIPopup from './ui/component/frame/UIPopup';

// Entry Point from HTML.
export let start = function () {
  PIXI.settings.RESOLUTION = window.devicePixelRatio;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  PIXI.settings.RENDER_OPTIONS.antialias = false;
  PIXI.settings.RENDER_OPTIONS.forceFXAA = false;
  PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF;
  PIXI.settings.SPRITE_MAX_TEXTURES = 1024;

  const loader = new PIXI.Loader();
  loader.add(DEFAULT_TEXTURES);

  const init = () => {
    setTimeout(() => {
      console.debug('Starting Editor');
      const editor = new Editor();
      editor.new();
      setTimeout(() => {
        editor.tilesetEditor.open();
        setTimeout(() => {
          editor.tilesetEditor.editTiles();

          const popup = new UIPopup('test', 'medium');
          // @ts-ignore
          window.popup = popup;

          popup.open({top: 64, left: 64}, 'top', 200);

        }, 10);
      }, 1000);
    }, 10);
  };

  console.debug('Loading textures..');
  loader.onComplete.add(() => {
    console.debug('Creating atlas..');
    DEFAULT_ATLAS.load(loader, init);
  });

  loader.load();
};
