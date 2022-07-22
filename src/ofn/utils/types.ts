import { Euler, Mat3, Mat4 } from '../../cga';
import { Vec2 } from '../../cga/math/Vec2';
import { Quat } from '../../cga/math/Quat';
import { Vec4 } from '../../cga/math/Vec4';
import { Vec3 } from '../../cga/math/Vec3';
/**
 * 定义字符串字典
 */
export interface IStringDictionary<T> {
    [index: string]: T;
}

/**
 * 定义数字字典
 */
export interface INumberDictionary<T> {
    [index: number]: T;
}

/**
 * 定义可空对象
 */
export type Nullable<T> = null | T;

/**
 * 定义可未定义对象
 */
export type Undefinable<T> = undefined | T;

/**
 * 定义可未定义对象
 */
export type UndefNullable<T> = undefined | null | T;


export function isDefined(value: any) {
    return value !== undefined && value !== null;
}

export function isArray(value: any) {
    return Array.isArray(value);
}

export function isNumber(value: any) {
    return !isNaN(value) || typeof value === 'number';
}

//Method
export function isUndefNull(value: any): boolean {
    return value === undefined || value === null;
}

export function isFinite(value: any) {
    return typeof value == 'number' && globalThis.isFinite(value);
}

export function isString(value: any): boolean {
    return typeof value == 'string';
}

/**
 * 不是对象元素
 * @param value 
 * @returns 
 */
export function isNoObject(value: any): boolean {
    return typeof value === 'number' ||
        typeof value === 'string' ||
        typeof value === 'boolean' ||
        typeof value === 'bigint';
}


export const copyValue = (src: any) => src;

export const cloneValue = (src: any) => src;

export const copyArray = (src: any, dest?: any) => {
    if (!src) {
        return src;
    }

    if (!dest) {
        return src.slice();
    }

    dest.length = 0;

    for (let i = 0; i < src.length; i++) {
        dest.push(src[i]);
    }

    return dest;
};

export const cloneArray = (src: any) => src && src.slice();
export const copyJSON = (src: any) => JSON.parse(JSON.stringify(src));

export const cloneJSON = (src: any) => JSON.parse(JSON.stringify(src));


export const copyCopyable = (src: any, dest?: any): any => {
    if (!src) {
        return src;
    }

    if (!dest) {
        return src.clone();
    }

    return dest.copy(src);
};

export const cloneClonable = (src: any): any => src && src.clone();


interface ITypeDefinition {
    name: string,
    default: any,
    copy: Function,
    clone: Function,
    isType?: true,
}

export function createType(typeDefinition: ITypeDefinition): ITypeDefinition {
    var mandatoryProperties = ["name", "default", "copy", "clone"];

    var undefinedProperties = mandatoryProperties.filter((p) => {
        return !typeDefinition.hasOwnProperty(p);
    });

    if (undefinedProperties.length > 0) {
        throw new Error(
            `createType expects a type definition with the following properties: ${undefinedProperties.join(
                ", "
            )}`
        );
    }

    typeDefinition.isType = true;

    return typeDefinition;
}

/**
 * Standard types
 */
export const Types = {
    Number: createType({
        name: "Number",
        default: 0,
        copy: copyValue,
        clone: cloneValue,
    }),

    Boolean: createType({
        name: "Boolean",
        default: false,
        copy: copyValue,
        clone: cloneValue,
    }),

    String: createType({
        name: "String",
        default: "",
        copy: copyValue,
        clone: cloneValue,
    }),

    Array: createType({
        name: "Array",
        default: [],
        copy: copyArray,
        clone: cloneArray,
    }),

    Ref: createType({
        name: "Ref",
        default: undefined,
        copy: copyValue,
        clone: cloneValue,
    }),

    JSON: createType({
        name: "JSON",
        default: null,
        copy: copyJSON,
        clone: cloneJSON,
    }),

    //Extends
    Vec2: createType({
        name: 'Vec2',
        default: new Vec2,
        copy: copyCopyable,
        clone: cloneClonable
    }),

    Vec3: createType({
        name: 'Vec3',
        default: new Vec3,
        copy: copyCopyable,
        clone: cloneClonable
    }),

    Vec4: createType({
        name: 'Vec4',
        default: new Vec4,
        copy: copyCopyable,
        clone: cloneClonable
    }),

    Mat3: createType({
        name: 'Mat3',
        default: new Mat3,
        copy: copyCopyable,
        clone: cloneClonable
    }),

    Mat4: createType({
        name: 'Mat4',
        default: new Mat4,
        copy: copyCopyable,
        clone: cloneClonable
    }),
    
    Quat: createType({
        name: 'Quat',
        default: new Quat,
        copy: copyCopyable,
        clone: cloneClonable
    }),
    Euler: createType({
        name: 'Euler',
        default: new Euler,
        copy: copyCopyable,
        clone: cloneClonable
    })
};