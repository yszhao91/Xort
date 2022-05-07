import { Color, Mat3, Mat4, Vec2, Vec4 } from '../../cga';

export class XortUnifrom {
    boundary: number;
    itemSize: number;
    offset: number;
    constructor(public name: string, public _value: any = null) {
        // used to build the uniform buffer according to the STD140 layout
        this.boundary = 0;
        this.itemSize = 0;

        // this property is set by XortUnifromsGroup and marks the start position in the uniform buffer
        this.offset = 0;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
}

export class FloatUniform extends XortUnifrom {
    constructor(name: string, value: number = 0) {
        super(name, value);

        this.boundary = 4;
        this.itemSize = 1;
    }
}


export class Vec2Uniform extends XortUnifrom {

    constructor(name: string, value = new Vec2()) {

        super(name, value);

        this.boundary = 8;
        this.itemSize = 2;

    }
}


export class Vec3Uniform extends XortUnifrom {

    constructor(name: string, value = new Vec2()) {

        super(name, value);

        this.boundary = 16;
        this.itemSize = 3;

    }
}

export class Vec4Uniform extends XortUnifrom {

    constructor(name: string, value = new Vec4()) {

        super(name, value);

        this.boundary = 16;
        this.itemSize = 4;

    }

}


export class ColorUniform extends XortUnifrom {

    constructor(name: string, value = new Color()) {

        super(name, value);

        this.boundary = 16;
        this.itemSize = 3;

    }

}


export class Mat3Uniform extends XortUnifrom {

    constructor(name: string, value = new Mat3()) {

        super(name, value);

        this.boundary = 48;
        this.itemSize = 12;

    }

}


export class Mat4Uniform extends XortUnifrom {

    constructor(name: string, value = new Mat4()) {

        super(name, value);

        this.boundary = 64;
        this.itemSize = 16;

    }

}


