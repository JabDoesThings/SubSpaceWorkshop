varying vec2 vTextureCoord;
uniform sampler2D uSampler;
vec3 colorToReplace;

void main(void) {

    gl_FragColor = texture2D(uSampler, vTextureCoord);

    if (gl_FragColor.r == colorToReplace.r
    && gl_FragColor.g == colorToReplace.g
    && gl_FragColor.b == colorToReplace.b) {
        discard;
    }
}
