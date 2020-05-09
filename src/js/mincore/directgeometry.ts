
export enum BufferType {
    ARRAY_BUFFER = 34962,
    ELEMENT_ARRAY_BUFFER = 34963,
    //以下webgl2
    TRANSFORM_FEEDBACK_BUFFER,
    UNIFORM_BUFFER,
    COPY_READ_BUFFER,
    COPY_WRITE_BUFFER,
    PIXEL_PACK_BUFFER,
    PIXEL_UNPACK_BUFFER,
}
export enum Usage {
    STATIC_DRAW,
    DYNAMIC_DRAW,
    STREAM_DRAW,
    //webgl2
    STATIC_READ,
    DYNAMIC_READ,
    STREAM_READ,
    STATIC_COPY,
    DYNAMIC_COPY,
    STREAM_COPY,
}

export class DirectGeometry {
    indices: any[];
    positions: any[];
    normals: any[];
    uvs: any[][];
    private postionBuffer: WebGLBuffer;
    constructor() {
        this.positions = [];
        this.normals = [];
        this.uvs = [[]];

    }

    createBuffer(gl: WebGL2RenderingContext, data: Array<any>, target: BufferType = BufferType.ARRAY_BUFFER, usage: Usage = Usage.STATIC_DRAW) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, new Float32Array(data), usage);
        return buffer;
    }


    createIndexBuffer(gl: WebGL2RenderingContext, data: Array<any>) {
        function arrayMax(array) {
            if (array.length === 0) return - Infinity;
            var max = array[0];
            for (var i = 1, l = array.length; i < l; ++i) {
                if (array[i] > max) max = array[i];
            }
            return max;
        }

        var databuffer = new (arrayMax(data) > 65535 ? Uint32Array : Uint16Array)(data);
        const buffer = gl.createBuffer();
        gl.bindBuffer(BufferType.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(BufferType.ELEMENT_ARRAY_BUFFER, new Float32Array(data), Usage.STATIC_DRAW);
        return buffer;
    }


    compile(gl: WebGL2RenderingContext) {

    }

}