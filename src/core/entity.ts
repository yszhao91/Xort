
import { IComponent, Component, Nullable } from '../of';
import { MetaEntity } from '../of/extends/entity/metaentity';
import { Xort } from './xort';
import { MaterialComponent } from './component/material';
import { GeometryComponent } from './component/geometry';
import { Undefinable } from '../of/utils/types';

export class XortEntity extends MetaEntity {
    xort: Xort;
    constructor(xort: Xort, option?: any) {
        super(option);
        this.xort = xort;
    }

    get material(): Undefinable<MaterialComponent> {
        let result = this._componentMap.get((MaterialComponent as any).name) as any;
        if (result)
            result = result[0];
        return result;
    }

    get geometry(): Undefinable<GeometryComponent> {
        let result = this._componentMap.get((GeometryComponent as any).name) as any;
        if (result)
            result = result[0];
        return result;
    }

    addComponent(com: IComponent | Component<any>): boolean {
        const result = super.addComponent(com)

        if (this.xort && result)
            this.xort.fire('onAddComponent', com);

        return result
    }
    removeComponent(com: IComponent): Nullable<IComponent> {
        const result = super.removeComponent(com)

        if (this.xort && result)
            this.xort.fire('onRemoveComponent', com);

        return result;
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
