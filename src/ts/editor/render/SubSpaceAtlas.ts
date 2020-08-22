import * as PIXI from "pixi.js";
import ProjectAtlas from './ProjectAtlas';
import  MapSprite  from './MapSprite';
import Loader = PIXI.Loader;
import  TextureAtlas  from './TextureAtlas';

const texFolder = 'assets/media';

export default class SubSpaceAtlas extends ProjectAtlas {

  load(loader: Loader, onComplete: () => void): void {
    this.clear();
    const tiles = new TextureAtlas('tiles', loader.resources[`${texFolder}/tiles.png`].texture);
    const flag = new TextureAtlas('flag', loader.resources[`${texFolder}/flag.png`].texture);
    const goal = new TextureAtlas('goal', loader.resources[`${texFolder}/goal.png`].texture);
    const prizes = new TextureAtlas('prizes', loader.resources[`${texFolder}/prizes.png`].texture);
    const over1 = new TextureAtlas('over1', loader.resources[`${texFolder}/over1.png`].texture);
    const over2 = new TextureAtlas('over2', loader.resources[`${texFolder}/over2.png`].texture);
    const over3 = new TextureAtlas('over3', loader.resources[`${texFolder}/over3.png`].texture);
    const over4 = new TextureAtlas('over4', loader.resources[`${texFolder}/over4.png`].texture);
    const over5 = new TextureAtlas('over5', loader.resources[`${texFolder}/over5.png`].texture);
    const wall = new TextureAtlas('wall', loader.resources[`${texFolder}/wall.png`].texture);
    const tile191 = new TextureAtlas('tile191', loader.resources[`${texFolder}/tile191.png`].texture);
    const tile = new TextureAtlas('tile', loader.resources[`${texFolder}/tile.png`].texture);
    const tileNoBrick = new TextureAtlas('tilenobrick', loader.resources[`${texFolder}/tilenobrick.png`].texture);
    const tileNoRadar = new TextureAtlas('tilenoradar', loader.resources[`${texFolder}/tilenoradar.png`].texture);
    const tileNoThor = new TextureAtlas('tilenothor', loader.resources[`${texFolder}/tilenothor.png`].texture);
    const tileNoWeapon = new TextureAtlas('tilenoweapon', loader.resources[`${texFolder}/tilenoweapon.png`].texture);

    this.setTextureAtlas(tiles);
    this.setTextureAtlas(flag);
    this.setTextureAtlas(goal);
    this.setTextureAtlas(prizes);
    this.setTextureAtlas(over1);
    this.setTextureAtlas(over2);
    this.setTextureAtlas(over3);
    this.setTextureAtlas(over4);
    this.setTextureAtlas(over5);
    this.setTextureAtlas(wall);
    this.setTextureAtlas(tile191);
    this.setTextureAtlas(tile);
    this.setTextureAtlas(tileNoWeapon);
    this.setTextureAtlas(tileNoThor);
    this.setTextureAtlas(tileNoRadar);
    this.setTextureAtlas(tileNoBrick);

    for (let index = 1; index <= 14; index++) {
      const name = `bg${index < 10 ? '0' + index : index}`;
      const texture = loader.resources[`assets/media/${name}.png`].texture;
      const atlas = new TextureAtlas(name, texture);
      this.setTextureAtlas(atlas);
      atlas.addSprite(name, new MapSprite(texture.width, texture.height));
    }

    for (let index = 1; index <= 7; index++) {
      const name = `star${index < 10 ? '0' + index : index}`;
      const texture = loader.resources[`assets/media/${name}.png`].texture;
      const atlas = new TextureAtlas(name, texture);
      this.setTextureAtlas(atlas);
      atlas.addSprite(name, new MapSprite(texture.width, texture.height));
    }

    const spriteFlagBlue = new MapSprite(16, 16, 10, 2, 90, 0, 0, 9, 0);
    const spriteFlagYellow = new MapSprite(16, 16, 10, 2, 90, 0, 1, 9, 1);
    const spriteGoalYellow = new MapSprite(16, 16, 9, 2, 90, 0, 0, 8, 0);
    const spriteGoalBlue = new MapSprite(16, 16, 9, 2, 90, 0, 1, 8, 1);
    const spriteOver1 = new MapSprite(16, 16, 15, 2, 80);
    const spriteOver2 = new MapSprite(32, 32, 10, 3, 60);
    const spriteOver3 = new MapSprite(16, 16, 15, 2, 80);
    const spriteOver4 = new MapSprite(96, 96, 5, 2, 80);
    const spriteOver5 = new MapSprite(80, 80, 4, 6, 80);
    const spritePrizes = new MapSprite(16, 16, 10, 1, 80);
    const spriteDoor01 = new MapSprite(16, 16, 19, 10, 80, 9, 8, 12, 8);
    const spriteDoor02 = new MapSprite(16, 16, 19, 10, 80, 13, 8, 16, 8);
    const spriteWallBlue = new MapSprite(16, 16, 10, 2, 100, 0, 0, 9, 0);
    const spriteWallYellow = new MapSprite(16, 16, 10, 2, 100, 0, 1, 9, 1);

    tile191.addSprite('tile191', new MapSprite(16, 16));
    tile.addSprite('tile', new MapSprite(16, 16));
    tileNoRadar.addSprite('tilenoradar', new MapSprite(16, 16));
    tileNoWeapon.addSprite('tilenoweapon', new MapSprite(16, 16));
    tileNoThor.addSprite('tilenothor', new MapSprite(16, 16));
    tileNoBrick.addSprite('tilenobrick', new MapSprite(16, 16));
    tiles.addSprite('door01', spriteDoor01);
    tiles.addSprite('door02', spriteDoor02);
    flag.addSprite('flagblue', spriteFlagBlue);
    flag.addSprite('flagyellow', spriteFlagYellow);
    goal.addSprite('goalblue', spriteGoalBlue);
    goal.addSprite('goalyellow', spriteGoalYellow);
    wall.addSprite('wallblue', spriteWallBlue);
    wall.addSprite('wallyellow', spriteWallYellow);
    over1.addSprite('over1', spriteOver1);
    over2.addSprite('over2', spriteOver2);
    over3.addSprite('over3', spriteOver3);
    over4.addSprite('over4', spriteOver4);
    over5.addSprite('over5', spriteOver5);
    prizes.addSprite('prizes', spritePrizes);

    onComplete();
  }
}

export const DEFAULT_ATLAS: SubSpaceAtlas = new SubSpaceAtlas(null);
export const DEFAULT_TEXTURES: string[] = [
  `${texFolder}/bg01.png`,
  `${texFolder}/bg02.png`,
  `${texFolder}/bg03.png`,
  `${texFolder}/bg04.png`,
  `${texFolder}/bg05.png`,
  `${texFolder}/bg06.png`,
  `${texFolder}/bg07.png`,
  `${texFolder}/bg08.png`,
  `${texFolder}/bg09.png`,
  `${texFolder}/bg10.png`,
  `${texFolder}/bg11.png`,
  `${texFolder}/bg12.png`,
  `${texFolder}/bg13.png`,
  `${texFolder}/bg14.png`,
  `${texFolder}/flag.png`,
  `${texFolder}/goal.png`,
  `${texFolder}/tiles.png`,
  `${texFolder}/over1.png`,
  `${texFolder}/over2.png`,
  `${texFolder}/over3.png`,
  `${texFolder}/over4.png`,
  `${texFolder}/over5.png`,
  `${texFolder}/prizes.png`,
  `${texFolder}/tile.png`,
  `${texFolder}/tile191.png`,
  `${texFolder}/tilenobrick.png`,
  `${texFolder}/tilenoradar.png`,
  `${texFolder}/tilenothor.png`,
  `${texFolder}/tilenoweapon.png`,
  `${texFolder}/star01.png`,
  `${texFolder}/star02.png`,
  `${texFolder}/star03.png`,
  `${texFolder}/star04.png`,
  `${texFolder}/star05.png`,
  `${texFolder}/star06.png`,
  `${texFolder}/star07.png`,
  `${texFolder}/wall.png`
];
