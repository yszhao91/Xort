/*
 * @Description  : 库管理抽象类
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-09-07 10:19:44
 * @LastEditTime : 2021-09-08 15:10:53
 * @FilePath     : \object_frame\src\core\manageplugins.ts
 * @example      :
 *  
 * export class ThingLibs extends Libs{
 *   private static _instanced;
 *   
 *   constructor() {
 *      super()
 *   }
 *  
 *  static get Instanced(): ThingLibs {
 *     if (!this._instanced)
 *         this._instanced = new ThingLibs();
 *     return this._instanced;
 *  }
 * 
 * }
 * 
 */
export class LibManager {
    private _preParamter: any = {}
    private _map: Map<string, any>;

    constructor() {
        this._map = new Map();
    }

    get plugins(): Map<string, any> {
        return this._map;
    }

    foreach(cb: (plugin: any) => void) {
        for (let value of this._map.values()) {
            cb(value);
        }
    }

    add(clazz: any, preParamters?: any) {
        const key: string = clazz.name;

        if (this._map.has(key)) {
            console.error(key + "库已存在");
            return;
        } else {
            this._map.set(key, clazz)

            if (preParamters)
                this._preParamter[key] = preParamters;
        }
    }

    remove(key: string) {
        this._map.delete(key)
        delete this._preParamter[key];
    }

    has(key: string): boolean {
        return this._map.has(key);
    }

    clear() {
        this._map.clear();
        this._preParamter = {}
    }

    get(key: string): { Class: any, preParamters: any } | undefined {

        const clazz = this._map.get(key);
        if (clazz)
            return { Class: clazz, preParamters: this._preParamter[key] };

    }


}