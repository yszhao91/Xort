import { IStringDictionary } from '../../cga/utils/types';
import { ITimer } from '../../of';
import { ISystemQuery, System } from '../system';
import { GeometryComponent } from '../components/geometry';
import { MaterialComponent } from '../../core/component/material';
export class MeshSystem extends System {
    static queries: IStringDictionary<ISystemQuery> = {
        entities: { components: [GeometryComponent, MaterialComponent] }
    };
    
    execute(timer: ITimer) {
        throw new Error('Method not implemented.');
    }

}