
import { TextureManager } from "../../core/textures";
import { arraysEqual, copyArray, emptyTexture3d, emptyCubeTexture, emptyTexture2dArray, emptyTexture } from "./utils";

const mat4array = new Float32Array(16);
const mat3array = new Float32Array(9);
const mat2array = new Float32Array(4);

export class SingleUniform {
    id: string;
    addr: WebGLUniformLocation;
    cache: any[];
    setValue: any;
    path: string;
    constructor(id: string, activeInfo: WebGLActiveInfo, addr: WebGLUniformLocation) {

        this.id = id;
        this.addr = addr;
        this.cache = [];
        this.setValue = this.getSingularSetter(activeInfo.type);

        this.path = activeInfo.name; // DEBUG
    }

    getSingularSetter(type: number) {

        switch (type) {

            case 0x1406: return this.setValueV1f; // FLOAT
            case 0x8b50: return this.setValueV2f; // _VEC2
            case 0x8b51: return this.setValueV3f; // _VEC3
            case 0x8b52: return this.setValueV4f; // _VEC4

            case 0x8b5a: return this.setValueM2; // _MAT2
            case 0x8b5b: return this.setValueM3; // _MAT3
            case 0x8b5c: return this.setValueM4; // _MAT4

            case 0x1404: case 0x8b56: return this.setValueV1i; // INT, BOOL
            case 0x8b53: case 0x8b57: return this.setValueV2i; // _VEC2
            case 0x8b54: case 0x8b58: return this.setValueV3i; // _VEC3
            case 0x8b55: case 0x8b59: return this.setValueV4i; // _VEC4

            case 0x1405: return this.setValueV1ui; // UINT
            case 0x8dc6: return this.setValueV2ui; // _VEC2
            case 0x8dc7: return this.setValueV3ui; // _VEC3
            case 0x8dc8: return this.setValueV4ui; // _VEC4

            case 0x8b5e: // SAMPLER_2D
            case 0x8d66: // SAMPLER_EXTERNAL_OES
            case 0x8dca: // INT_SAMPLER_2D
            case 0x8dd2: // UNSIGNED_INT_SAMPLER_2D
            case 0x8b62: // SAMPLER_2D_SHADOW
                return this.setValueT1;

            case 0x8b5f: // SAMPLER_3D
            case 0x8dcb: // INT_SAMPLER_3D
            case 0x8dd3: // UNSIGNED_INT_SAMPLER_3D
                return this.setValueT3D1;

            case 0x8b60: // SAMPLER_CUBE
            case 0x8dcc: // INT_SAMPLER_CUBE
            case 0x8dd4: // UNSIGNED_INT_SAMPLER_CUBE
            case 0x8dc5: // SAMPLER_CUBE_SHADOW
                return this.setValueT6;

            case 0x8dc1: // SAMPLER_2D_ARRAY
            case 0x8dcf: // INT_SAMPLER_2D_ARRAY
            case 0x8dd7: // UNSIGNED_INT_SAMPLER_2D_ARRAY
            case 0x8dc4: // SAMPLER_2D_ARRAY_SHADOW
                return this.setValueT2DArray1;

        }

    }


    // Single scalar

    setValueV1f(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (cache[0] === v) return;

        gl.uniform1f(this.addr, v);

        cache[0] = v;

    }

    // Single float vector (from flat array or THREE.VectorN)

    setValueV2f(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (v.x !== undefined) {

            if (cache[0] !== v.x || cache[1] !== v.y) {

                gl.uniform2f(this.addr, v.x, v.y);

                cache[0] = v.x;
                cache[1] = v.y;

            }

        } else {

            if (arraysEqual(cache, v)) return;

            gl.uniform2fv(this.addr, v);

            copyArray(cache, v);

        }

    }

    setValueV3f(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (v.x !== undefined) {

            if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z) {

                gl.uniform3f(this.addr, v.x, v.y, v.z);

                cache[0] = v.x;
                cache[1] = v.y;
                cache[2] = v.z;

            }

        } else if (v.r !== undefined) {

            if (cache[0] !== v.r || cache[1] !== v.g || cache[2] !== v.b) {

                gl.uniform3f(this.addr, v.r, v.g, v.b);

                cache[0] = v.r;
                cache[1] = v.g;
                cache[2] = v.b;

            }

        } else {

            if (arraysEqual(cache, v)) return;

            gl.uniform3fv(this.addr, v);

            copyArray(cache, v);

        }

    }

    setValueV4f(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (v.x !== undefined) {

            if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z || cache[3] !== v.w) {

                gl.uniform4f(this.addr, v.x, v.y, v.z, v.w);

                cache[0] = v.x;
                cache[1] = v.y;
                cache[2] = v.z;
                cache[3] = v.w;

            }

        } else {

            if (arraysEqual(cache, v)) return;

            gl.uniform4fv(this.addr, v);

            copyArray(cache, v);

        }

    }

    // Single matrix (from flat array or THREE.MatrixN)

    setValueM2(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;
        const elements = v.elements;

        if (elements === undefined) {

            if (arraysEqual(cache, v)) return;

            gl.uniformMatrix2fv(this.addr, false, v);

            copyArray(cache, v);

        } else {

            if (arraysEqual(cache, elements)) return;

            mat2array.set(elements);

            gl.uniformMatrix2fv(this.addr, false, mat2array);

            copyArray(cache, elements);

        }

    }

    setValueM3(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;
        const elements = v.elements;

        if (elements === undefined) {

            if (arraysEqual(cache, v)) return;

            gl.uniformMatrix3fv(this.addr, false, v);

            copyArray(cache, v);

        } else {

            if (arraysEqual(cache, elements)) return;

            mat3array.set(elements);

            gl.uniformMatrix3fv(this.addr, false, mat3array);

            copyArray(cache, elements);

        }

    }

    setValueM4(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;
        const elements = v.elements;

        if (elements === undefined) {

            if (arraysEqual(cache, v)) return;

            gl.uniformMatrix4fv(this.addr, false, v);

            copyArray(cache, v);

        } else {

            if (arraysEqual(cache, elements)) return;

            mat4array.set(elements);

            gl.uniformMatrix4fv(this.addr, false, mat4array);

            copyArray(cache, elements);

        }

    }

    // Single integer / boolean

    setValueV1i(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (cache[0] === v) return;

        gl.uniform1i(this.addr, v);

        cache[0] = v;

    }

    // Single integer / boolean vector (from flat array)

    setValueV2i(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (arraysEqual(cache, v)) return;

        gl.uniform2iv(this.addr, v);

        copyArray(cache, v);

    }

    setValueV3i(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (arraysEqual(cache, v)) return;

        gl.uniform3iv(this.addr, v);

        copyArray(cache, v);

    }

    setValueV4i(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (arraysEqual(cache, v)) return;

        gl.uniform4iv(this.addr, v);

        copyArray(cache, v);

    }

    // Single unsigned integer

    setValueV1ui(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (cache[0] === v) return;

        gl.uniform1ui(this.addr, v);

        cache[0] = v;

    }

    // Single unsigned integer vector (from flat array)

    setValueV2ui(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (arraysEqual(cache, v)) return;

        gl.uniform2uiv(this.addr, v);

        copyArray(cache, v);

    }

    setValueV3ui(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (arraysEqual(cache, v)) return;

        gl.uniform3uiv(this.addr, v);

        copyArray(cache, v);

    }

    setValueV4ui(gl: WebGL2RenderingContext, v: any) {

        const cache = this.cache;

        if (arraysEqual(cache, v)) return;

        gl.uniform4uiv(this.addr, v);

        copyArray(cache, v);

    }


    // Single texture (2D / Cube)

    setValueT1(gl: WebGL2RenderingContext, v: any, textures: TextureManager) {

        const cache = this.cache;
        const unit = textures.allocateTextureUnit(); 
        if (cache[0] !== unit) {

            gl.uniform1i(this.addr, unit);
            cache[0] = unit;

        }

        textures.safeSetTexture2D(v || emptyTexture, unit);

    }

    setValueT3D1(gl: WebGL2RenderingContext, v: any, textures: TextureManager) {

        const cache = this.cache;
        const unit = textures.allocateTextureUnit();

        if (cache[0] !== unit) {

            gl.uniform1i(this.addr, unit);
            cache[0] = unit;

        }

        textures.setTexture3D(v || emptyTexture3d, unit);

    }

    setValueT6(gl: WebGL2RenderingContext, v: any, textures: TextureManager) {

        const cache = this.cache;
        const unit = textures.allocateTextureUnit();

        if (cache[0] !== unit) {

            gl.uniform1i(this.addr, unit);
            cache[0] = unit;

        }

        textures.safeSetTextureCube(v || emptyCubeTexture, unit);

    }

    setValueT2DArray1(gl: WebGL2RenderingContext, v: any, textures: TextureManager) {

        const cache = this.cache;
        const unit = textures.allocateTextureUnit();

        if (cache[0] !== unit) {

            gl.uniform1i(this.addr, unit);
            cache[0] = unit;

        }

        textures.setTexture2DArray(v || emptyTexture2dArray, unit);

    }


}
