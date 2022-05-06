import { BaseSystem } from "../../core/baseSystem";
import { ITimer } from "../../core/timer";

export class TransformSystem extends BaseSystem {
    private static _instanced: TransformSystem;
    constructor() {
        super();
    }

    public static Register(component: any): void {
        if (!this._instanced)
            this._instanced = new TransformSystem();

        this._instanced.Register(component);
    }

    public static get Components(): TransformSystem[] {
        return this._instanced.components;
    }

    public static Update(timer: ITimer) {
        if (!this._instanced)
            this._instanced = new TransformSystem();

        this._instanced.Update(timer);
    }
}