import { Vec } from "../../cga/math/Vec";
import { IStringDictionary } from "../../of";
import { Vec3 } from '../../cga/math/Vec3';
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

export type BuiltinAttributeName =
    | 'position'
    | 'normal'
    | 'uv'
    | 'uv2'
    | 'tangent'
    | 'color'
    | 'skinIndex'
    | 'skinWeight'
    | 'instanceMatrix'
    | 'morphTarget0'
    | 'morphTarget1'
    | 'morphTarget2'
    | 'morphTarget3'
    | 'morphTarget4'
    | 'morphTarget5'
    | 'morphTarget6'
    | 'morphTarget7'
    | 'morphNormal0'
    | 'morphNormal1'
    | 'morphNormal2'
    | 'morphNormal3';

export const isBufferArray = (obj: any) => {
    var types = ['Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array']
    return types.indexOf(obj.constructor.name) > -1;
}

export const locationDic: IStringDictionary<number> = {
    position: 0,
    normal: 1,
    uv: 2,
    color: 3,
    uv2: 4,
    tangent: 5,
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
    offset: number = 0;
    location: number = -1;
    format: GPUVertexFormat = 'float32';

    constructor(array: TypedArray, stride: number, name: string = '', normalized: boolean = false) {
        this.array = array;
        this.stride = stride;
        this.format = (stride > 1 ? 'float32x' + stride : 'float32') as GPUVertexFormat;
        this.updateRange = { offset: 0, count: -1 };
        this.count = array !== undefined ? array.length / stride : 0;
        this.normalized = normalized;
        this.name = name;
        this.version = 0;
        this.location = locationDic[name] !== undefined ? locationDic[name] : -1;
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

    index?: BufferAttribute;
    indexFormat: GPUIndexFormat = 'uint32';
    attributes: IStringDictionary<BufferAttribute> = {}

    constructor() {
    }

    setData(name: string, data: Array<number>, stride: number = 3, arrayType: any = Float32Array) {
        (this.data as any)[name] = data;
        const attribute = new BufferAttribute(new arrayType(data), stride, name);
        this.attributes[name] = attribute
    }


    setIndex(index: BufferAttribute | TypedArray | number[]) {
        if (index instanceof BufferAttribute) {
            this.index = index;
        } else if (Array.isArray(index)) {
            this.index = Vec.max(index as any) > 65535 ?
                new BufferAttribute(new Uint32Array(index), 1) :
                new BufferAttribute(new Uint16Array(index), 1);
            this.indexFormat = 'uint32';
        } else {
            this.index = Vec.max(index as any) > 65535 ?
                new BufferAttribute(index, 1) :
                new BufferAttribute(index, 1);
            this.indexFormat = 'uint16';
        }
    }

    getIndex() {
        return this.index;
    }

    setAttribute(name: string, attribute: BufferAttribute | TypedArray | number[], stride: number = 3, clazz?: any) {
        if ((attribute as BufferAttribute).isBufferAttribute)
            this.attributes[name] = attribute as BufferAttribute;
        else if (Array.isArray(attribute)) {
            this.attributes[name] = new BufferAttribute(new clazz(attribute), stride, name);
        } else
            this.attributes[name] = new BufferAttribute(attribute as TypedArray, stride, name);
    }

    getAttribute(name: string) {
        if (this.attributes[name])
            return this.attributes[name];
        else {
            throw ('不存在buffer' + name)
        }
    }

    static planeGeometry(width = 1, height = 1, widthSegment = 1, heightSegment = 1) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const widthSeg = Math.floor(widthSegment);
        const heightSeg = Math.floor(heightSegment);

        const unitW = width / widthSeg;
        const unitH = height / heightSeg;

        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];

        const widthSeg1 = (widthSeg + 1);
        const heightSeg1 = (heightSeg + 1);
        for (let iy = 0; iy <= heightSeg; iy++) {
            const y = iy * unitH - halfHeight;
            for (let ix = 0; ix < widthSeg; ix++) {
                const x = ix * unitW - halfWidth;
                vertices.push(x, y, 0);

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
        geometry.setAttribute('position', new Float32Array(vertices), 3);
        geometry.setAttribute('normal', new Float32Array(normals), 3);
        geometry.setAttribute('uv', new Float32Array(uvs), 2);
        geometry.setIndex(indices);
    }

    static cubeGeometry(width: number = 1, height: number = 1, depth = 1, widthSegment: number = 1, heightSegment: number = 1, depthSegment: number = 1) {
        widthSegment = Math.floor(widthSegment);
        heightSegment = Math.floor(heightSegment);
        depthSegment = Math.floor(depthSegment);
        const indices: number[] = [];
        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];

        let numberOfVertices = 0;
        let groupStart = 0;
        // build each side of the box geometry

        const geometry = new GeometryData();
        buildPlane('z', 'y', 'x', - 1, - 1, depth, height, width, depthSegment, heightSegment, 0); // px
        buildPlane('z', 'y', 'x', 1, - 1, depth, height, - width, depthSegment, heightSegment, 1); // nx
        buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegment, depthSegment, 2); // py
        buildPlane('x', 'z', 'y', 1, - 1, width, depth, - height, widthSegment, depthSegment, 3); // ny
        buildPlane('x', 'y', 'z', 1, - 1, width, height, depth, widthSegment, heightSegment, 4); // pz
        buildPlane('x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegment, heightSegment, 5); // nz

        geometry.setAttribute('position', new Float32Array(vertices), 3);
        geometry.setAttribute('normal', new Float32Array(normals), 3);
        geometry.setAttribute('uv', new Float32Array(uvs), 2);
        geometry.setIndex(indices);

        function buildPlane(u: string, v: string, w: string, udir: number, vdir: number, width: number, height: number, depth: number, gridX: number, gridY: number, materialIndex: number) {

            const segmentWidth = width / gridX;
            const segmentHeight = height / gridY;

            const widthHalf = width / 2;
            const heightHalf = height / 2;
            const depthHalf = depth / 2;

            const gridX1 = gridX + 1;
            const gridY1 = gridY + 1;

            let vertexCounter = 0;
            let groupCount = 0;

            const vector: any = new Vec3();

            // generate vertices, normals and uvs

            for (let iy = 0; iy < gridY1; iy++) {

                const y = iy * segmentHeight - heightHalf;

                for (let ix = 0; ix < gridX1; ix++) {

                    const x = ix * segmentWidth - widthHalf;

                    // set values to correct vector component

                    vector[u] = x * udir;
                    vector[v] = y * vdir;
                    vector[w] = depthHalf;

                    // now apply vector to vertex buffer

                    vertices.push(vector.x, vector.y, vector.z);

                    // set values to correct vector component

                    vector[u] = 0;
                    vector[v] = 0;
                    vector[w] = depth > 0 ? 1 : - 1;

                    // now apply vector to normal buffer

                    normals.push(vector.x, vector.y, vector.z);

                    // uvs

                    uvs.push(ix / gridX);
                    uvs.push(1 - (iy / gridY));

                    // counters

                    vertexCounter += 1;

                }

            }

            // indices

            // 1. you need three indices to draw a single face
            // 2. a single segment consists of two faces
            // 3. so we need to generate six (2*3) indices per segment

            for (let iy = 0; iy < gridY; iy++) {

                for (let ix = 0; ix < gridX; ix++) {

                    const a = numberOfVertices + ix + gridX1 * iy;
                    const b = numberOfVertices + ix + gridX1 * (iy + 1);
                    const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                    const d = numberOfVertices + (ix + 1) + gridX1 * iy;

                    // faces

                    indices.push(a, b, d);
                    indices.push(b, c, d);

                    // increase counter

                    groupCount += 6;

                }

            }

            // add a group to the geometry. this will ensure multi material support

            // geometry.addGroup(groupStart, groupCount, materialIndex);

            // calculate new start value for groups

            groupStart += groupCount;

            // update total number of vertices

            numberOfVertices += vertexCounter;

        }

        return geometry;
    }


    static sphereGeometry(radius = 1, widthSegment = 32, heightSegment = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
        widthSegment = Math.max(3, Math.floor(widthSegment));
        heightSegment = Math.max(2, Math.floor(heightSegment));

    }
}