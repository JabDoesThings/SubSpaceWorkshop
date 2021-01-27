import * as PIXI from "pixi.js";

export default class ChromaFilter extends PIXI.Filter {

  constructor(red: number, green: number, blue: number, thresholdSensitivity: number = 0.2, smoothing: number = 0.1) {

    red = Math.round(red);
    green = Math.round(green);
    blue = Math.round(blue);

    if (red < 0 || red > 255) {
      throw new Error(`The value red is out of bounds. (${red}) Color values should be 0-255.`);
    } else if (green < 0 || green > 255) {
      throw new Error(`The value green is out of bounds. (${green}) Color values should be 0-255.`);
    } else if (blue < 0 || blue > 255) {
      throw new Error(`The value blue is out of bounds. (${blue}) Color values should be 0-255.`);
    }

    super(null, [
      'varying vec2 vTextureCoord;',
      'uniform sampler2D uSampler;',
      'void main(void) {',
      '    gl_FragColor = texture2D(uSampler, vTextureCoord);',
      `    if (gl_FragColor.r == ${red}.0 && gl_FragColor.g == ${green}.0 && gl_FragColor.b == ${blue}.0) {`,
      '        discard;',
      '    }',
      '}'
    ].join("\n"));
  }
}
