import { Entity, IEntityOptions } from "../../core/entity";  
import { TransformComponent } from "../component/transform";

/**
 * @description : 元实体  包含空间信息的一切实体
 * @param        {*}
 * @return       {*}
 * @example     : 
 */
export class MetaEntity extends Entity {

    constructor(options: IEntityOptions = {}) {
        super(options);

        const transfrom = new TransformComponent({ entity: this })
        this.addComponent(transfrom);
    }

    get transfrom(): TransformComponent {
        return this._componentMap.get((TransformComponent as any).name) as any;
    }

    toJSON() {
        throw new Error("Method not implemented.");
    }

    fromJSON(json: any) {
        throw new Error("Method not implemented.");
    }
}