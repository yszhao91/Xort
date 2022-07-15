import { ITimer } from 'object_frame';
import { IStringDictionary } from '../../cga/utils/types';
import { ISystemQuery, System } from '../system';
import { TransfromComponent } from '../components/transfrom';
import { Entity } from '../entity';
export class TransfromSystem extends System {
    static queries: IStringDictionary<ISystemQuery> = {
        transfroms: { components: [TransfromComponent] }
    };

    execute(timer: ITimer) {
        const transfroms = this.queries.transfroms.entities;
        for (let i = 0; i < transfroms.length; i++) {
            const transfrom: Entity = transfroms[i];
            transfrom.getComponent(TransfromComponent);

        }
    }

}