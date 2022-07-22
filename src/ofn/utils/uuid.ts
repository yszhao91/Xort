
/**
 * @Description  :
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-07-09 15:40:53
 * @LastEditTime : 2021-09-27 14:25:29
 * @FilePath     : \object_frame\src\core\uuid.ts
 */
import { IStringDictionary } from "../../ofn/utils/types";

const _lut: any = [];

for (let i = 0; i < 256; i++) {
    _lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

export class UUID {
    private static _instanced: UUID;
    private _id: number = 0;
    private _dic: IStringDictionary<number> = {};
    constructor() {

    }

    get newId() {
        return this._id++;
    }

    getID(prefix: string, showPrefix: boolean = false): number | string {
        if (prefix && this._dic[prefix] === undefined) {
            this._dic[prefix] = 0;
            const newId = this._dic[prefix]++
            if (showPrefix)
                return prefix + newId
            return newId
        }

        const newId = this._dic[prefix]++
        if (showPrefix)
            return prefix + newId;

        return newId;
    }

    static get Instanced(): UUID {
        if (!this._instanced)
            this._instanced = new UUID();
        return this._instanced;
    }

    /**
     * @description : 生成唯一ID
     * @param        {*}
     * @return       {*}
     * @example     : 
     */
    static get unique(): string {
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136 
        const d0 = Math.random() * 0xffffffff | 0;
        const d1 = Math.random() * 0xffffffff | 0;
        const d2 = Math.random() * 0xffffffff | 0;
        const d3 = Math.random() * 0xffffffff | 0;
        const uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
            _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
            _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
            _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];

        // .toUpperCase() here flattens concatenated strings to save heap memory space.
        return uuid.toUpperCase();
    }
}