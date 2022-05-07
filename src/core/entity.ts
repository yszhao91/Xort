import { ITimer } from '../of';
import { MetaEntity } from '../of/extends/entity/metaentity';

export class XortEntity extends MetaEntity {
    constructor(option?: any) {
        super(option);
    }

    //API   
    nextStep(timer: ITimer) {
        for (let len = this.children.length, i = 0; i < len; i++) {
            const entity: XortEntity = this.children[i] as XortEntity;
            entity.nextStep(timer);
        }
    }
}
