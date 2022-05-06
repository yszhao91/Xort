import { ITimer } from '../../of';
import { BaseSystem } from '../../of/core/baseSystem';

export class GeometrySystem extends BaseSystem { 
    private static _instanced: GeometrySystem;
    constructor() {
        super();
    }

    public static Register(component: any): void {
        if (!this._instanced)
            this._instanced = new GeometrySystem();

        this._instanced.Register(component);
    }

    public static get Components(): GeometrySystem[] {
        return this._instanced.components;
    }

    public static Update(timer: ITimer) {
        if (!this._instanced)
            this._instanced = new GeometrySystem();

        this._instanced.Update(timer);
    }
}