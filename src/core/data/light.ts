import { Color } from '../../cga/math/Color';
export enum ILightType {
    Ambient = 0,
    Directional = 1,
    Point = 2,
    Spot = 3
}
export class LightData {
    type: ILightType = ILightType.Directional;
    color: Color = new Color();
    intensity: number = 1;

    //spot 
    distance: number = 0;
    angle = Math.PI / 3;
    penumbra = 0;
    decay = 1; // for physically correct lights, should be 2.

    constructor() {

    }
}