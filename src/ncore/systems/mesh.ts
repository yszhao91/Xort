import { ITimer } from "object_frame";
import { IStringDictionary } from "../../cga/utils/types";
import { ISystemQuery, System } from "../../nof/system";
import { MaterialComponent } from "../components/material";
import { GeometryComponent } from '../components/geometry';

export class MeshSystem extends System {
    static queries: IStringDictionary<ISystemQuery> = {
        entities: { components: [GeometryComponent, MaterialComponent] }
    }

    init = (attributes: any) => {
        
    }

    execute(timer: ITimer) {
        const entities = this._queriesEntity.entities.results;
        for (let i = 0, len = entities.length; i < len; i++) {

        }
    }

}