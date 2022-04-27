import { Vec2 } from '../../math/Vec2';
export class Box2 {
    min: Vec2 = new Vec2;
    max: Vec2 = new Vec2;
    constructor(min?: Vec2, max?: Vec2) {
        this.min.copy(min);
        this.max.copy(max);
    }

    set(min: Vec2, max: Vec2) {
        this.min.copy(min);
        this.max.copy(max);
    }

    isEmpty() {
        return (this.max.x < this.min.x) || (this.max.y < this.min.y);
    }

    getCenter(target: Vec2) {
        return this.isEmpty() ? target.set(0, 0) : target.addVecs(this.min, this.max).multiplyScalar(0.5);
    }

    getSize(target: Vec2): any {
        return this.isEmpty() ? target.set( 0, 0 ) : target.subVecs( this.max, this.min );

    }
}