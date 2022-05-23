import { Color } from '../cga';
import { MetaEntity } from '../of/extends/entity/metaentity';
import { Xort } from './xort';
export class XortScene extends MetaEntity {
    camera: any;
    background: Color = Color.White;
    depthTexture: any;
    depth: boolean = true;
    constructor() {
        super()

        if (this.depth) {
        }
    }

    nextStep(xort: Xort): void {
        super.nextStep(xort)
    }

}