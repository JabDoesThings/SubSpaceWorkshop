// import { MapSprite, MapSpriteCollection } from './MapSprite';
// import * as PIXI from "pixi.js";
//
// /**
//  * The <i>LVLSpriteCollection</i> class. TODO: Document.
//  *
//  * @author Jab
//  */
// export class LVLSpriteCollection extends MapSpriteCollection {
//
//     mapSpriteFlag: MapSprite;
//     mapSpriteGoal: MapSprite;
//     mapSpritePrize: MapSprite;
//     mapSpriteOver1: MapSprite;
//     mapSpriteOver2: MapSprite;
//     mapSpriteOver3: MapSprite;
//     mapSpriteOver4: MapSprite;
//     mapSpriteOver5: MapSprite;
//     mapSpriteDoor1: MapSprite;
//     mapSpriteDoor2: MapSprite;
//
//     mapSpriteBrickBlue: MapSprite;
//     mapSpriteBrickYellow: MapSprite;
//
//     constructor() {
//
//         super();
//
//         let loadTexture = (sprite: MapSprite, path: string) => {
//             let source = <HTMLImageElement> document.createElement('img');
//             source.src = path;
//             source.onload = () => {
//                 sprite.texture = PIXI.Texture.from(source);
//                 sprite.setTexture();
//             };
//         };
//
//         this.mapSpriteFlag = new MapSprite(16, 16, 10, 2, 90, 0, 0, 9, 0);
//         this.mapSpriteGoal = new MapSprite(16, 16, 9, 2, 90, 0, 1, 8, 1);
//         this.mapSpriteOver1 = new MapSprite(16, 16, 15, 2, 80);
//         this.mapSpriteOver2 = new MapSprite(32, 32, 10, 3, 80);
//         this.mapSpriteOver3 = new MapSprite(16, 16, 15, 2, 80);
//         this.mapSpriteOver4 = new MapSprite(96, 96, 5, 2, 80);
//         this.mapSpriteOver5 = new MapSprite(80, 80, 4, 6, 80);
//         this.mapSpritePrize = new MapSprite(16, 16, 10, 1, 80);
//         this.mapSpriteDoor1 = new MapSprite(16, 16, 19, 10, 80, 9, 8, 12, 8);
//         this.mapSpriteDoor2 = new MapSprite(16, 16, 19, 10, 80, 13, 8, 16, 8);
//         this.mapSpriteBrickBlue = new MapSprite(16, 16, 10, 2, 100, 0, 0, 9, 0);
//         this.mapSpriteBrickYellow = new MapSprite(16, 16, 10, 2, 100, 0, 1, 9, 1);
//
//         loadTexture(this.mapSpriteBrickBlue, 'assets/media/wall.png');
//         loadTexture(this.mapSpriteBrickYellow, 'assets/media/wall.png');
//         loadTexture(this.mapSpritePrize, 'assets/media/prizes.png');
//         loadTexture(this.mapSpriteOver1, 'assets/media/over1.png');
//         loadTexture(this.mapSpriteOver2, 'assets/media/over2.png');
//         loadTexture(this.mapSpriteOver3, 'assets/media/over3.png');
//         loadTexture(this.mapSpriteOver4, 'assets/media/over4.png');
//         loadTexture(this.mapSpriteOver5, 'assets/media/over5.png');
//
//         this.addSprite(this.mapSpriteFlag);
//         this.addSprite(this.mapSpriteGoal);
//         this.addSprite(this.mapSpriteOver1);
//         this.addSprite(this.mapSpriteOver2);
//         this.addSprite(this.mapSpriteOver3);
//         this.addSprite(this.mapSpriteOver4);
//         this.addSprite(this.mapSpriteOver5);
//         this.addSprite(this.mapSpritePrize);
//         this.addSprite(this.mapSpriteDoor1);
//         this.addSprite(this.mapSpriteDoor2);
//         this.addSprite(this.mapSpriteBrickBlue);
//         this.addSprite(this.mapSpriteBrickYellow);
//     }
//
//     reset() {
//         this.mapSpriteFlag.reset();
//         this.mapSpriteGoal.reset();
//         this.mapSpritePrize.reset();
//         this.mapSpriteOver1.reset();
//         this.mapSpriteOver2.reset();
//         this.mapSpriteOver3.reset();
//         this.mapSpriteOver4.reset();
//         this.mapSpriteOver5.reset();
//         this.mapSpriteDoor1.reset();
//         this.mapSpriteDoor2.reset();
//     }
// }
