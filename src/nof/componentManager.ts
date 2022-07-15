import { World } from './world'; 
import { ObjectPool } from './objectPool';
import { UUID } from '../of';
export class ComponentManager {
    components: any = [];
    _componentsMap: any = {};
    numComponents: any = {};
    /**
     * 每种组件都分配各自一个管理池
     */
    private _componentPool: any = {};
    constructor(private world?: World) {
    }

    hasComponent(Component: any) {
        return this.components.indexOf(Component) !== -1;
    }

    registerComponent(Component: any, objectPool?: any) {
        if (this.hasComponent(Component)) {
            console.warn(` <${Component.getName()}>组件已经注册`);
            return;
        }

        const schema = Component.schema;

        if (!schema)
            throw new Error(`组件<${Component.getName()}>没有schema`);

        for (const propName in schema) {
            const prop = schema[propName];

            if (!prop.type) {
                throw new Error(`无效的schema在组件<"${Component.getName()}>上". 没找到 <"${propName}">属性 .`);
            }
        }

        Component._typeId = UUID.Instanced.getID('Component');
        this.components.push(Component);
        this._componentsMap[Component._typeId] = Component;
        this.numComponents[Component._typeId] = 0;

        if (objectPool === undefined) {
            objectPool = new ObjectPool(Component);
        } else if (objectPool === false) {
            objectPool = undefined;
        }

        this._componentPool[Component._typeId] = objectPool;
    }

    componentAddedToEntity(Component: any) {
        this.numComponents[Component._typeId]++;
    }

    componentRemovedFromEntity(Component: any) {
        this.numComponents[Component._typeId]--;
    }

    getComponentsPool(Component: any) {
        return this._componentPool[Component._typeId];
    }
}