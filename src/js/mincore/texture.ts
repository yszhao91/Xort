export enum TextureType {
    TEXTURE_2D = 3553,
    TEXTURE_CUBE_MAP = 34067,
    TEXTURE_3D = 0x806F,
    TEXTURE_2D_ARRAY = 0x8C1A,
}

export class Texture {
    constructor() {

    }

    create(gl: WebGL2RenderingContext, type: TextureType = TextureType.TEXTURE_2D) {
        const texure = gl.createTexture();
        gl.bindTexture(type, texure);
        // gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2)
        gl.texParameteri
    }
}