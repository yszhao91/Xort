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