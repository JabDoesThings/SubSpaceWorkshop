varying vec2 vTextureCoord;
varying vec4 vFrame;
varying float vTextureId;
uniform vec4 shadowColor;
uniform sampler2D uSamplers[%count%];
uniform vec2 uSamplerSize[%count%];

void main(void) {

   vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);
   float textureId = floor(vTextureId + 0.5);
   vec4 color;

   %forloop%

   if(color.r == 0.0 && color.g == 0.0 && color.b == 0.0) {
       discard;
   }

   gl_FragColor = color;
}
