
import { MetaEntity } from '../of/extends/entity/metaentity';
import { Xort } from './xort';

export class XortEntity extends MetaEntity {
    material: any;
    geometry: any;
    constructor(option?: any) {
        super(option);
    }

    //API   
    nextStep(xort: Xort) {
        xort.fire('nextStepEntity', this);
        super.nextStep(xort);
    }

    add<XortEntity>(entity: XortEntity) {
        this.xort.fire('onEntityAdd', this, entity);
        super.add(entity as any);
        return this;
    }

    remove<XortEntity>(entity: XortEntity) {
        this.xort.fire('onEntityRemove', this, entity);
        super.remove(entity as any);
        return this;
    }

}
