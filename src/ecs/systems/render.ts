import { Entity, IStringDictionary, ISystemQuery, ITimer, System } from "@xort/of";
import { GeometryComponent } from "../components/geometry";
import { LightComponent } from "../components/light";

export class MeshSystem extends System {

    static queries: IStringDictionary<ISystemQuery> = {
        geometry: { components: [GeometryComponent] },
        light: { components: [LightComponent] }
    };

    async execute(_timer: ITimer) {
        const geometryEntities = this.queries.geometry.entities;
        for (let i = 0; i < geometryEntities.length; i++) {
            const geoEntity: Entity = geometryEntities[i]; 
            
            
        }
    }

}