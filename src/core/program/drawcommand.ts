/**
 * 绘制的要素
 */
export class DrawCommand {
    program: WebGLProgram | undefined;
    //是否是实例化
    instanceCount: number = 0;
    _boundingBox: any;
    constructor() {

    }


}