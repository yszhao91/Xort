export class Color {
    private _array: number[] = [];
    constructor(public r: number = 1, public g: number = 1, public b: number = 1, public a: number = 1) {

    }

    get array() {
        return this.toArray();
    }

    toArray() {
        this._array.push(this.r, this.g, this.b, this.a);
        return this._array;
    }

    setFromArray(ary: Array<number>, offset: number = 0) {
        this.r = ary[offset + 0] || 1.0;
        this.g = ary[offset + 1] || 1.0;
        this.b = ary[offset + 2] || 1.0;
        this.a = ary[offset + 3] || 1.0;
    }

    copy(other: Color) {
        this.r = other.r;
        this.g = other.g;
        this.b = other.b;
        this.a = other.a;
    }

    setFromHex(hex: number) {
        if (hex > 0xffffff) {

        }
    }

    clone() {
        return new Color().copy(this)
    }

    static get White() { return new Color(); }
    static get Black() { return new Color(0, 0, 0); }
    static get Red() { return new Color(1, 0, 0); }
    static get Blue() { return new Color(0, 0, 1); }
    static get Green() { return new Color(0, 1, 0); }

}
