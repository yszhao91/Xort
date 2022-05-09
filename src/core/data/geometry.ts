import { TypedArray } from "../../cga/render/types";
import { IStringDictionary } from "../../of";

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
    instanceCount: number = 1;
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

    _attributes: IStringDictionary<BufferAttribute> = {}

    constructor() {
    }

    setData(name: string, data: Array<number>, stride: number = 3, arrayType: any = Float32Array) {
        (this.data as any)[name] = data;
        const attribute = new BufferAttribute(new arrayType(data), stride);
        this._attributes[name] = attribute
    }

    setAttribute(name: string, attribute: BufferAttribute) {
        this._attributes[name] = attribute
    }

    getAttribute(name: string) {
        if (this._attributes[name])
            return this._attributes[name];
        else {
            throw ('不存在buffer' + name)
        }
    }

}