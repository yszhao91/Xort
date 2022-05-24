import { Color } from '../cga';
import { Xort } from './xort';
import { XortEntity } from './entity';
import { IStringDictionary } from '../cga/utils/types';
export class XortScene extends XortEntity {
    camera: any;
    background: Color = new Color(0.5, 0.5, 0.6);
    depthTexture: any;
    depth: boolean = true;
    _items: IStringDictionary<XortEntity> = {};
    opaque: XortEntity[] = [];
    transparent: XortEntity[] = [];
    constructor(xort: Xort) {
        super(xort)

        if (this.depth) {
        }

        this.xort.on('nextStepEntity', (entity: XortEntity) => {
            if (entity.material && entity.material.transparent)
                this.transparent.push(entity);
            else
                this.opaque.push(entity);
        });

    }

    nextStep(xort: Xort): void {
        this.opaque = [];
        this.transparent = [];
        super.nextStep(xort);
    }

    
}