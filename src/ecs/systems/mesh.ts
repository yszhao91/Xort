import { Entity, IStringDictionary, ISystemQuery, ITimer, System } from "@xort/of";
import { GeometryComponent } from "../components/geometry";

export class MeshSystem extends System {

    static queries: IStringDictionary<ISystemQuery> = {
        geometry: { components: [GeometryComponent] }
    };

    async execute(timer: ITimer) {
        const geometryEntities = this.queries.geometry.entities;
        for (let i = 0; i < geometryEntities.length; i++) {
            const geoEntity: Entity = geometryEntities[i];

            

        }
    }

}