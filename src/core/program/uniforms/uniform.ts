import { IStringDictionary } from '../../../of';
import { TextureManager } from '../../manager/texturemanager';
import { PureArrayUniform } from './PureArrayUniform';
import { SingleUniform } from './SingleUniform';
import { StructuredUniform } from './StructuredUniform';
import { RePathPart } from './utils';

// --- Utilities ---


export class GLUniforms {
    seq: any = [];
    map: IStringDictionary<SingleUniform> = {};

    constructor(private gl: WebGL2RenderingContext, program: WebGLProgram) {

        const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < n; ++i) {

            const info: WebGLActiveInfo = gl.getActiveUniform(program, i)!;
            const addr: WebGLUniformLocation = gl.getUniformLocation(program, info.name)!;

            this.parseUniform(info, addr, this);

        }

    }

    parseUniform(activeInfo: WebGLActiveInfo, addr: WebGLUniformLocation, container: any) {

        const path: string = activeInfo.name;
        const pathLength: number = path.length;

        // reset RegExp object, because of the early exit of a previous run
        RePathPart.lastIndex = 0;

        while (true) {

            const match: RegExpExecArray = RePathPart.exec(path)!;
            const matchEnd: number = RePathPart.lastIndex;

            let id: any = match[1];
            const idIsIndex = match[2] === ']',
                subscript = match[3];

            if (idIsIndex) id = id | 0; // convert to integer

            if (subscript === undefined || subscript === '[' && matchEnd + 2 === pathLength) {

                // bare name or "pure" bottom-level array "[0]" suffix 
                const uniform = subscript === undefined ? new SingleUniform(id, activeInfo, addr) : new PureArrayUniform(id, activeInfo, addr)
                this.addUniform(container, uniform);

                break;

            } else {

                // step into inner node / create it in case it doesn't exist

                const map = container.map;
                let next = map[id];

                if (next === undefined) {

                    next = new StructuredUniform(id);
                    this.addUniform(container, next);

                }

                container = next;

            }

        }

    }


    addUniform(container: any, uniformObject: PureArrayUniform | SingleUniform) {

        container.seq.push(uniformObject);
        container.map[uniformObject.id] = uniformObject;

    }



    setValue(name: string, value: any, textures?: any) {

        const u = this.map[name];

        if (u !== undefined) u.setValue(this.gl, value, textures);

    };

    setOptional(object: any, name: string) {

        const v = object[name];

        if (v !== undefined) this.setValue(name, v);

    }


    // Static interface

    static upload(gl: WebGL2RenderingContext, seq: any[], values: any, textures: TextureManager) {

        for (let i = 0, n = seq.length; i !== n; ++i) {

            const u = seq[i],
                v = values[u.id];

            if (v.needsUpdate !== false) {

                // note: always updating when .needsUpdate is undefined
                u.setValue(gl, v.value, textures);

            }

        }

    };

    static seqWithValue(seq: any, values: any) {

        const r = [];

        for (let i = 0, n = seq.length; i !== n; ++i) {

            const u = seq[i];
            if (u.id in values) r.push(u);

        }

        return r;

    };
}

/**
 * Uniforms and Attributes [5.14.10] [3.7.8]
 * Values used by the shaders are passed in as a uniform of vertex attributes.
 * void disableVertexAttribArray(uint index);
 * index: [0, MAX_VERTEX_ATTRIBS - 1]
 * void enableVertexAttribArray(uint index);
 * index: [0, MAX_VERTEX_ATTRIBS - 1]
 * WebGLActiveInfo? getActiveAttrib(WebGLProgram program, uint index);
 * WebGLActiveInfo? getActiveUniform(
 * WebGLProgram program, uint index);
 * int getAttribLocation(WebGLProgram program, string name);
 * any getUniform(WebGLProgram? program, uint location);
 * WebGLUniformLocation? getUniformLocation(
 * Object program, string name);
 * any getVertexAttrib(uint index, enum pname);
 * pname: CURRENT_VERTEX_ATTRIB ,
 * VERTEX_ATTRIB_ARRAY_{BUFFER_BINDING, ENABLED},
 * VERTEX_ATTRIB_ARRAY_{NORMALIZED, SIZE, STRIDE, TYPE},
 * VERTEX_ATTRIB_ARRAY_{INTEGER, DIVISOR}
 * long getVertexAttribOffset(uint index, enum pname);
 * Corresponding OpenGL ES function is GetVertexAttribPointerv
 * pname: VERTEX_ATTRIB_ARRAY_POINTER
 * void uniform[1234]fv(WebGLUniformLocation? location, Float32List data[, uint srcOffset=0[, uint srcLength=0]]);
 * void uniform[1234]iv(WebGLUniformLocation? location, Int32List data[, uint srcOffset=0[, uint srcLength=0]]);
 * void uniform[1234]uiv(WebGLUniformLocation? location, Uint32List data[, uint srcOffset=0[, uint srcLength=0]]);
 * void uniformMatrix[234]fv(WebGLUniformLocation? location, bool transpose, Float32List data[, uint srcOffset=0[,
 * uint srcLength=0]]);
 * void uniformMatrix[234]x[234]fv(
 * WebGLUniformLocation? location, bool transpose, Float32List data[, uint srcOffset=0[, uint srcLength=0]]);
 * void vertexAttrib[1234]f(uint index, ...);
 * void vertexAttrib[1234]fv(uint index, Array value);
 * void vertexAttribI4[u]i[v](uint index, ...);
 * void vertexAttribPointer(uint index, int size, enum type, bool normalized, long stride, long offset);
 * type: BYTE, SHORT, UNSIGNED_{BYTE, SHORT}, FIXED, FLOAT
 * index: [0, MAX_VERTEX_ATTRIBS - 1]
 * stride: [0, 255]
 * offset, stride: must be a multiple of the type size in WebGL
 * void vertexAttribIPointer(uint index, int size, enum type, sizei stride, intptr offset);
*/