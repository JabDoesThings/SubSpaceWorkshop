import { Editor } from './simple/Editor';
import * as PIXI from "pixi.js";
import { ProjectAtlas, TextureAtlas } from './simple/render/ProjectAtlas';
import { MapSprite } from './simple/render/MapSprite';
import { Project } from './simple/Project';

export let DEFAULT_ATLAS = new ProjectAtlas(null);

// Entry Point from HTML.
export let start = function () {
  PIXI.settings.RESOLUTION = window.devicePixelRatio;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  PIXI.settings.RENDER_OPTIONS.antialias = false;
  PIXI.settings.RENDER_OPTIONS.forceFXAA = false;
  PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF;
  PIXI.settings.SPRITE_MAX_TEXTURES = 1024;

  const tex = (id: string, texture: PIXI.Texture): TextureAtlas => {
    return new TextureAtlas(id, texture);
  };

  const loader = new PIXI.Loader();
  loader.add([
    `assets/media/tiles.png`,
    `assets/media/flag.png`,
    `assets/media/goal.png`,
    `assets/media/prizes.png`,
    `assets/media/over1.png`,
    `assets/media/over2.png`,
    `assets/media/over3.png`,
    `assets/media/over4.png`,
    `assets/media/over5.png`,
    `assets/media/wall.png`,
    `assets/media/tile191.png`,
    `assets/media/tile.png`,
    `assets/media/tilenobrick.png`,
    `assets/media/tilenoradar.png`,
    `assets/media/tilenothor.png`,
    `assets/media/tilenoweapon.png`,
    'assets/media/bg01.png',
    'assets/media/bg02.png',
    'assets/media/bg03.png',
    'assets/media/bg04.png',
    'assets/media/bg05.png',
    'assets/media/bg06.png',
    'assets/media/bg07.png',
    'assets/media/bg08.png',
    'assets/media/bg09.png',
    'assets/media/bg10.png',
    'assets/media/bg11.png',
    'assets/media/bg12.png',
    'assets/media/bg13.png',
    'assets/media/bg14.png',
    'assets/media/star01.png',
    'assets/media/star02.png',
    'assets/media/star03.png',
    'assets/media/star04.png',
    'assets/media/star05.png',
    'assets/media/star06.png',
    'assets/media/star07.png',
  ]);

  loader.onComplete.add(() => {

    const tiles = tex('tiles', loader.resources["assets/media/tiles.png"].texture);
    const flag = tex('flag', loader.resources["assets/media/flag.png"].texture);
    const goal = tex('goal', loader.resources["assets/media/goal.png"].texture);
    const prizes = tex('prizes', loader.resources["assets/media/prizes.png"].texture);
    const over1 = tex('over1', loader.resources["assets/media/over1.png"].texture);
    const over2 = tex('over2', loader.resources["assets/media/over2.png"].texture);
    const over3 = tex('over3', loader.resources["assets/media/over3.png"].texture);
    const over4 = tex('over4', loader.resources["assets/media/over4.png"].texture);
    const over5 = tex('over5', loader.resources["assets/media/over5.png"].texture);
    const wall = tex('wall', loader.resources["assets/media/wall.png"].texture);
    const tile191 = tex('tile191', loader.resources["assets/media/tile191.png"].texture);
    const tile = tex('tile', loader.resources["assets/media/tile.png"].texture);
    const tilenobrick = tex('tilenobrick', loader.resources["assets/media/tilenobrick.png"].texture);
    const tilenoradar = tex('tilenoradar', loader.resources["assets/media/tilenoradar.png"].texture);
    const tilenothor = tex('tilenothor', loader.resources["assets/media/tilenothor.png"].texture);
    const tilenoweapon = tex('tilenoweapon', loader.resources["assets/media/tilenoweapon.png"].texture);

    DEFAULT_ATLAS.setTextureAtlas(tiles);
    DEFAULT_ATLAS.setTextureAtlas(flag);
    DEFAULT_ATLAS.setTextureAtlas(goal);
    DEFAULT_ATLAS.setTextureAtlas(prizes);
    DEFAULT_ATLAS.setTextureAtlas(over1);
    DEFAULT_ATLAS.setTextureAtlas(over2);
    DEFAULT_ATLAS.setTextureAtlas(over3);
    DEFAULT_ATLAS.setTextureAtlas(over4);
    DEFAULT_ATLAS.setTextureAtlas(over5);
    DEFAULT_ATLAS.setTextureAtlas(wall);
    DEFAULT_ATLAS.setTextureAtlas(tile191);
    DEFAULT_ATLAS.setTextureAtlas(tile);
    DEFAULT_ATLAS.setTextureAtlas(tilenoweapon);
    DEFAULT_ATLAS.setTextureAtlas(tilenothor);
    DEFAULT_ATLAS.setTextureAtlas(tilenoradar);
    DEFAULT_ATLAS.setTextureAtlas(tilenobrick);

    for (let index = 1; index <= 14; index++) {
      const name = 'bg' + (index < 10 ? '0' + index : index);
      const texture = loader.resources['assets/media/' + name + '.png'].texture;
      const atlas = tex(name, texture);
      DEFAULT_ATLAS.setTextureAtlas(atlas);
      atlas.addSprite(name, new MapSprite(texture.width, texture.height));
    }

    for (let index = 1; index <= 7; index++) {
      const name = 'star' + (index < 10 ? '0' + index : index);
      const texture = loader.resources['assets/media/' + name + '.png'].texture;
      const atlas = tex(name, texture);
      DEFAULT_ATLAS.setTextureAtlas(atlas);
      atlas.addSprite(name, new MapSprite(texture.width, texture.height));
    }

    const s_flagblue = new MapSprite(16, 16, 10, 2, 90, 0, 0, 9, 0);
    const s_flagyellow = new MapSprite(16, 16, 10, 2, 90, 0, 1, 9, 1);
    const s_goalyellow = new MapSprite(16, 16, 9, 2, 90, 0, 0, 8, 0);
    const s_goalblue = new MapSprite(16, 16, 9, 2, 90, 0, 1, 8, 1);
    const s_over1 = new MapSprite(16, 16, 15, 2, 80);
    const s_over2 = new MapSprite(32, 32, 10, 3, 60);
    const s_over3 = new MapSprite(16, 16, 15, 2, 80);
    const s_over4 = new MapSprite(96, 96, 5, 2, 80);
    const s_over5 = new MapSprite(80, 80, 4, 6, 80);
    const s_prizes = new MapSprite(16, 16, 10, 1, 80);
    const s_door01 = new MapSprite(16, 16, 19, 10, 80, 9, 8, 12, 8);
    const s_door02 = new MapSprite(16, 16, 19, 10, 80, 13, 8, 16, 8);
    const s_wallblue = new MapSprite(16, 16, 10, 2, 100, 0, 0, 9, 0);
    const s_wallyellow = new MapSprite(16, 16, 10, 2, 100, 0, 1, 9, 1);

    tile191.addSprite('tile191', new MapSprite(16, 16));
    tile.addSprite('tile', new MapSprite(16, 16));
    tilenoradar.addSprite('tilenoradar', new MapSprite(16, 16));
    tilenoweapon.addSprite('tilenoweapon', new MapSprite(16, 16));
    tilenothor.addSprite('tilenothor', new MapSprite(16, 16));
    tilenobrick.addSprite('tilenobrick', new MapSprite(16, 16));
    tiles.addSprite('door01', s_door01);
    tiles.addSprite('door02', s_door02);
    flag.addSprite('flagblue', s_flagblue);
    flag.addSprite('flagyellow', s_flagyellow);
    goal.addSprite('goalblue', s_goalblue);
    goal.addSprite('goalyellow', s_goalyellow);
    wall.addSprite('wallblue', s_wallblue);
    wall.addSprite('wallyellow', s_wallyellow);
    over1.addSprite('over1', s_over1);
    over2.addSprite('over2', s_over2);
    over3.addSprite('over3', s_over3);
    over4.addSprite('over4', s_over4);
    over5.addSprite('over5', s_over5);
    prizes.addSprite('prizes', s_prizes);

    setTimeout(() => {
      console.log("### START ###");
      const editor = new Editor();
      editor.new();
      setTimeout(() => {
        editor.tilesetEditor.open();
      }, 1000);
    }, 10);
  });


  loader.load();

  // let library = new Library(null, 'test');
  // library.set(new Sprite(null, 'test'));
  // library.toBuffer((buffer) => {
  //     const fs = require('fs');
  //
  //     let dir = process.env.HOMEDRIVE + process.env.HOMEPATH + '/SubSpaceWorkshop/';
  //
  //     if (!fs.existsSync(dir)) {
  //         fs.mkdirSync(dir);
  //     }
  //
  //     let libDir = dir + '/Libraries/';
  //     if (!fs.existsSync(libDir)) {
  //         fs.mkdirSync(libDir);
  //     }
  //
  //     fs.writeFileSync(libDir + 'test.sswl', buffer);
  // });
};

