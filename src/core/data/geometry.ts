import { Vec } from "../../cga/math/Vec";
import { IStringDictionary } from "../../of";
export type TypedArray =
    Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

export const isBufferArray = (obj: any) => {
    var types = ['Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array']
    return types.indexOf(obj.constructor.name) > -1;
}

export class BufferAttribute {
    name: string = '';
    array: TypedArray;
    stride: number;
    // usage: Usage;
    updateRange: { offset: number; count: number };
    version: number;
    normalized: boolean;
    count: number;

    isInterleaved: boolean = false;
    isInstance: boolean = false;
    instanceCount: number = 1;
    readonly isBufferAttribute: boolean = true;
    constructor(array: TypedArray, stride: number, normalized: boolean = false) {
        this.array = array;
        this.stride = stride;
        this.updateRange = { offset: 0, count: -1 };
        this.count = array !== undefined ? array.length / stride : 0;
        this.normalized = normalized;
        this.version = 0;
    }

    set needsUpdate(value: boolean) {
        if (value === true)
            this.version++;
    }

}

export class GeometryData {
    data: {
        position: Array<number>,
        index?: Array<number>
        normal?: Array<number>,
        uv?: Array<number>,
        uv2?: Array<number>,
        tangent?: Array<number>,
        color?: Array<number>
    } = {
            position: [],
        }
    userData: any;

    _index?: BufferAttribute;
    _attributes: IStringDictionary<BufferAttribute> = {}

    constructor() {
    }

    setData(name: string, data: Array<number>, stride: number = 3, arrayType: any = Float32Array) {
        (this.data as any)[name] = data;
        const attribute = new BufferAttribute(new arrayType(data), stride);
        this._attributes[name] = attribute
    }


    setIndex(index: BufferAttribute | TypedArray | number[]) {
        if (index instanceof BufferAttribute) {
            this._index = index;
        } else if (Array.isArray(index)) {
            this._index = Vec.max(index as any) > 65535 ?
                new BufferAttribute(new Uint32Array(index), 1) :
                new BufferAttribute(new Uint16Array(index), 1);
        } else {
            this._index = Vec.max(index as any) > 65535 ?
                new BufferAttribute(index, 1) :
                new BufferAttribute(index, 1);
        }
    }

    getIndex() {
        return this._index;
    }

    setAttribute(name: string, attribute: BufferAttribute | TypedArray | number[], stride: number = 3, clazz?: any) {
        if ((attribute as BufferAttribute).isBufferAttribute)
            this._attributes[name] = attribute as BufferAttribute;
        else if (Array.isArray(attribute)) {
            this._attributes[name] = new BufferAttribute(new clazz(attribute), stride);
        } else
            this._attributes[name] = new BufferAttribute(attribute as TypedArray, stride);
    }

    getAttribute(name: string) {
        if (this._attributes[name])
            return this._attributes[name];
        else {
            throw ('不存在buffer' + name)
        }
    }

    static planeGeometry(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const widthSeg = Math.floor(widthSegments);
        const heightSeg = Math.floor(heightSegments);

        const unitW = width / widthSeg;
        const unitH = height / heightSeg;

        const indices = [];
        const positions = [];
        const normals = [];
        const uvs = [];

        const widthSeg1 = (widthSeg + 1);
        const heightSeg1 = (heightSeg + 1);
        for (let iy = 0; iy <= heightSeg; iy++) {
            const y = iy * unitH - halfHeight;
            for (let ix = 0; ix < widthSeg; ix++) {
                const x = ix * unitW - halfWidth;
                positions.push(x, y, 0);

                normals.push(0, 0, 1);

                uvs.push(ix / widthSeg1);
                uvs.push(1 - (iy / heightSeg1));
            }
        }

        for (let iy = 0; iy < heightSeg; iy++) {
            for (let ix = 0; ix < widthSeg; ix++) {
                const a = ix + heightSeg1 * iy;
                const b = (ix + 1) + widthSeg1 * iy;
                const c = (ix + 1) + widthSeg1 * (iy + 1);
                const d = ix + widthSeg1 * (iy + 1);

                indices.push(a, b, c);
                indices.push(a, c, d);
            }
        }

        const geometry = new GeometryData();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
        geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3))
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(indices);
    }


    static cubeGeometry(width: number = 1, height: number = 1, depth = 1, widthSegment: number = 1, heightSegment: number = 1, depthSegment: number = 1) {
        const hw = width / 2;
        const hd = depth / 2;

    }

    static sphereGeometry(radius = 1, widthSegments = 32, heightSegments = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
        widthSegments = Math.max(3, Math.floor(widthSegments));
        heightSegments = Math.max(2, Math.floor(heightSegments));

    }
}