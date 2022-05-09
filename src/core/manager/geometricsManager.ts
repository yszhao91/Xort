import { Xort } from '../xort';
import { BaseManager } from './baseManager';
import { GeometryComponent } from '../component/geometry';
import { GeometryData } from '../data/geometry';

export class GeometricsMananger extends BaseManager {
    constructor(xort: Xort) {
        super(xort);
    }

    update(geometry: GeometryComponent) {
        const info = this.xort.statistics;
        const attributes = this.xort.attributeManager;
        if (this.has(geometry) === false) {
            info.memory.geometries++;
        }

        const geometryData = (geometry.object as GeometryData);
        const geometryAttributes = geometryData._attributes;

        for (const name in geometryAttributes) {
            if (name === 'index')
                attributes.update(geometryAttributes[name], true);
            else
                attributes.update(geometryAttributes[name]);
        }
    }
}