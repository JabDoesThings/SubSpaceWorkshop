window.$ = window.jQuery = require('jquery');
const fs = require('fs');
const stats = require("stats.js");
const uuid = require('uuid');
const PIXI = window.PIXI = require("pixi.js");
require("pixi-tilemap");

$(document).on('dragstart', '*', function (event) {
  event.preventDefault();
});

const tilemapChromaFragmentShader = fs.readFileSync("assets/glsl/tilemap_chroma.frag").toString();
window.tilemapChromaFragmentShader = tilemapChromaFragmentShader;
PIXI.tilemap.shaderGenerator.generateFragmentSrc = (maxTextures) => {
  return tilemapChromaFragmentShader.replace(/%count%/gi, maxTextures + "")
    .replace(/%forloop%/gi, PIXI.tilemap.shaderGenerator.generateSampleSrc(maxTextures));
};

// Project JS files.
const main = require("./assets/js/main.js");

// Start application.
$(function () {
  console.log('### START ###');
  main.start();
});
