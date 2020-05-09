import { clear } from '../GL';

export class Renderer {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    constructor(options: any = {}) {
        this.canvas = options.canvas;
        this.gl = this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");

    }

    setSize(width, height) {
        this.gl.viewport(0, 0, width, height);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    render() {
        const gl = this.gl;
    }
}