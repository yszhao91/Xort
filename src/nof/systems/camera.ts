import { ITimer } from 'object_frame';
import { IStringDictionary } from '../../cga/utils/types';
import { ISystemQuery, System } from '../system';
import { CameraComponent } from '../../core/component/camera';
import { TransfromComponent } from '../components/transfrom';
export class CameraSystem extends System {
    static queries: IStringDictionary<ISystemQuery> = { entities: { components: [CameraComponent, TransfromComponent] } };

    execute(timer: ITimer) {
        for (const key in this._queriesEntity) {
            const element = this._queriesEntity[key];

        }
    }

}