varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {

    gl_FragColor = texture2D(uSampler, vTextureCoord);

    if (gl_FragColor.r == 0.0 && gl_FragColor.g == 0.0 && gl_FragColor.b == 0.0) {
        gl_FragColor.a = 0.0;
    }
}
