export class Cache {
    enabled: boolean = true;
    protected _map: Map<any, any>;

    constructor() {
        this._map = new Map();
    }

    add(key: string | number, file: any) {

        if (this.enabled === false) return;

        this._map.set(key, file);

    }

    get(key: string | number) {

        if (this.enabled === false) return;

        return this._map.get(key);

    }

    remove(key: string | number) {

        this._map.delete(key)

    }

    updateAttr(key: any, attr: any, value: any) {
        this._map.get(key)[attr] = value;
    }

    has(key: string): boolean {
        return this._map.has(key);
    }

    clear() {
        if (this._map.clear)
            this._map.clear();

    }

    dispose() {
        this._map = new Map();
    }

};

/**
 * 1，WeakMap只接受对象作为键名（null除外），不接受其他类型的值作为键名。
 * 2，WeakMap的键名所指向的对象，不计入垃圾回收机制。
 */
export class WeakCache {
    enabled: boolean = true;
    protected _map: WeakMap<any, any>;

    constructor() {
        this._map = new WeakMap();
    }

    add(key: any, value: any) {

        if (this.enabled === false) return;

        this._map.set(key, value);

    }

    get(key: any) {

        if (this.enabled === false) return;

        return this._map.get(key);

    }

    updateAttr(key: any, attr: any, value: any) {
        this._map.get(key)[attr] = value;
    }

    remove(key: any) {

        this._map.delete(key)

    }

    has(key: any): boolean {
        return this._map.has(key);
    }

    dispose() {
        this._map = new WeakMap;
    }

};


