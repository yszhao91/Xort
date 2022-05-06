import { Texture } from '../../texture';
import { TextureManager } from '../../manager/texturemanager';

// Array Caches (provide typed arrays for temporary by size)

const arrayCacheF32: any[] = [];
const arrayCacheI32: any[] = [];
// Float32Array caches used for uploading Matrix uniforms

export const emptyTexture = new Texture();
export const emptyCubeTexture = null;
export const emptyTexture3d = null
export const emptyTexture2dArray = null;

export function flatten(array: any[], nBlocks: number, blockSize: number) {

    const firstElem = array[0];

    if (firstElem <= 0 || firstElem > 0) return array;
    // unoptimized: ! isNaN( firstElem )
    // see http://jacksondunstan.com/articles/983

    const n = nBlocks * blockSize;
    let r = arrayCacheF32[n];

    if (r === undefined) {

        r = new Float32Array(n);
        arrayCacheF32[n] = r;

    }

    if (nBlocks !== 0) {

        firstElem.toArray(r, 0);

        for (let i = 1, offset = 0; i !== nBlocks; ++i) {

            offset += blockSize;
            array[i].toArray(r, offset);

        }

    }

    return r;

}

export function arraysEqual(a: string | any[], b: string | any[]) {

    if (a.length !== b.length) return false;

    for (let i = 0, l = a.length; i < l; i++) {

        if (a[i] !== b[i]) return false;

    }

    return true;

}

export function copyArray(a: any[], b: string | any[]) {

    for (let i = 0, l = b.length; i < l; i++) {

        a[i] = b[i];

    }

}

// Texture unit allocation

export function allocTexUnits(textures: TextureManager, n: number) {

    let r = arrayCacheI32[n];

    if (r === undefined) {

        r = new Int32Array(n);
        arrayCacheI32[n] = r;

    }

    for (let i = 0; i !== n; ++i) {

        r[i] = textures.allocateTextureUnit();

    }

    return r;

}



// Parser - builds up the property tree from the path strings

export const RePathPart = /(\w+)(\])?(\[|\.)?/g;

