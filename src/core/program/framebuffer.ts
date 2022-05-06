export class FrameBuffer {
    constructor() {

    }

    static createFrameBuffer(gl: WebGL2RenderingContext) {
        const framebuffer = gl.createFramebuffer();
        gl.createRenderbuffer()
    }
}