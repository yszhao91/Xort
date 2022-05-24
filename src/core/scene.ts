import { Color } from '../cga';
import { MetaEntity } from '../of/extends/entity/metaentity';
import { Xort } from './xort';
export class XortScene extends MetaEntity {
    camera: any;
    background: Color = new Color(0.5, 0.5, 0.6);
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