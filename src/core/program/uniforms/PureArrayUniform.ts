import { flatten, allocTexUnits, emptyTexture, emptyCubeTexture } from "./utils";
import { GL } from '../../GL'; 
import { TextureManager } from "../../manager/texturemanager";

export class PureArrayUniform {
    id: string;
    addr: WebGLUniformLocation;
    cache: never[];
    size: number;
    setValue: ((gl: WebGL2RenderingContext, v: any, textures: any
        // --- Utilities ---
        // Array Caches (provide typed arrays for temporary by size)
    ) => void) | undefined;
    path: string;
    constructor(id: string, activeInfo: WebGLActiveInfo, addr: WebGLUniformLocation) {
        this.id = id;
        this.addr = addr;
        this.cache = [];
        this.size = activeInfo.size;
        this.setValue = this.getPureArraySetter(activeInfo.type);

        this.path = activeInfo.name; // DEBUG
    }


    // Helper to pick the right setter for a pure (bottom-level) array

    getPureArraySetter(type: number) {

        switch (type) {

            case GL.FLOAT: return this.setValueV1fArray; // FLOAT
            case GL.FLOAT_VEC2: return this.setValueV2fArray; // _VEC2
            case GL.FLOAT_VEC3: return this.setValueV3fArray; // _VEC3
            case GL.FLOAT_VEC4: return this.setValueV4fArray; // _VEC4

            case GL.FLOAT_MAT2: return this.setValueM2Array; // _MAT2
            case 0x8b5b: return this.setValueM3Array; // _MAT3
            case 0x8b5c: return this.setValueM4Array; // _MAT4

            case 0x1404: case 0x8b56: return this.setValueV1iArray; // INT, BOOL
            case 0x8b53: case 0x8b57: return this.setValueV2iArray; // _VEC2
            case 0x8b54: case 0x8b58: return this.setValueV3iArray; // _VEC3
            case 0x8b55: case 0x8b59: return this.setValueV4iArray; // _VEC4

            case 0x1405: return this.setValueV1uiArray; // UINT
            case 0x8dc6: return this.setValueV2uiArray; // _VEC2
            case 0x8dc7: return this.setValueV3uiArray; // _VEC3
            case 0x8dc8: return this.setValueV4uiArray; // _VEC4

            case 0x8b5e: // SAMPLER_2D
            case 0x8d66: // SAMPLER_EXTERNAL_OES
            case 0x8dca: // INT_SAMPLER_2D
            case 0x8dd2: // UNSIGNED_INT_SAMPLER_2D
            case 0x8b62: // SAMPLER_2D_SHADOW
                return this.setValueT1Array;

            case 0x8b60: // SAMPLER_CUBE
            case 0x8dcc: // INT_SAMPLER_CUBE
            case 0x8dd4: // UNSIGNED_INT_SAMPLER_CUBE
            case 0x8dc5: // SAMPLER_CUBE_SHADOW
                return this.setValueT6Array;

        }

    }


    setValueV1fArray(gl: WebGL2RenderingContext, v: any) {

        gl.uniform1fv(this.addr, v);

    }

    setValueV2fArray(gl: WebGL2RenderingContext, v: any) {

        const data = flatten(v, this.size, 2);

        gl.uniform2fv(this.addr, data);

    }

    setValueV3fArray(gl: WebGL2RenderingContext, v: any) {

        const data = flatten(v, this.size, 3);

        gl.uniform3fv(this.addr, data);

    }


    setValueV4fArray(gl: WebGL2RenderingContext, v: any) {

        const data = flatten(v, this.size, 4);

        gl.uniform4fv(this.addr, data);

    }

    // Array of matrices (from flat array or array of THREE.MatrixN)

    setValueM2Array(gl: WebGL2RenderingContext, v: any) {

        const data = flatten(v, this.size, 4);

        gl.uniformMatrix2fv(this.addr, false, data);

    }

    setValueM3Array(gl: WebGL2RenderingContext, v: any) {

        const data = flatten(v, this.size, 9);

        gl.uniformMatrix3fv(this.addr, false, data);
    }


    setValueM4Array(gl: WebGL2RenderingContext, v: any) {

        const data = flatten(v, this.size, 16);

        gl.uniformMatrix4fv(this.addr, false, data);

    }

    // Array of integer / boolean

    setValueV1iArray(gl: WebGL2RenderingContext, v: any) {

        gl.uniform1iv(this.addr, v);

    }

    // Array of integer / boolean vectors (from flat array)

    setValueV2iArray(gl: WebGL2RenderingContext, v: any) {

        gl.uniform2iv(this.addr, v);

    }

    setValueV3iArray(gl: WebGL2RenderingContext, v: any) {

        gl.uniform3iv(this.addr, v);

    }

    setValueV4iArray(gl: WebGL2RenderingContext, v: any) {

        gl.uniform4iv(this.addr, v);

    }

    // Array of unsigned integer

    setValueV1uiArray(gl: WebGL2RenderingContext, v: any) {

        gl.uniform1uiv(this.addr, v);

    }

    // Array of unsigned integer vectors (from flat array)

    setValueV2uiArray(gl: WebGL2RenderingContext, v: any) {

        gl.uniform2uiv(this.addr, v);

    }

    setValueV3uiArray(gl: WebGL2RenderingContext, v: any) {

        gl.uniform3uiv(this.addr, v);

    }

    setValueV4uiArray(gl: WebGL2RenderingContext, v: any) {

        gl.uniform4uiv(this.addr, v);

    }


    // Array of textures (2D / Cube)

    setValueT1Array(gl: WebGL2RenderingContext, v: any, textures: TextureManager) {

        const n = v.length;

        const units = allocTexUnits(textures, n);

        gl.uniform1iv(this.addr, units);

        for (let i = 0; i !== n; ++i) {

            textures.safeSetTexture2D(v[i] || emptyTexture, units[i]);

        }

    }

    setValueT6Array(gl: WebGL2RenderingContext, v: any, textures: any) {

        const n = v.length;

        const units = allocTexUnits(textures, n);

        gl.uniform1iv(this.addr, units);

        for (let i = 0; i !== n; ++i) {

            textures.safeSetTextureCube(v[i] || emptyCubeTexture, units[i]);

        }

    }

}
