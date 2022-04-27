import { Component } from "../core/component";
import { Entity } from "../core/entity";
import { LibManager } from "../core/libmanager";

/**
  * @Description  : 组件管理器 
  * @Author       : 赵耀圣
  * @QQ           : 549184003
  * @Date         : 2021-07-08 10:27:19
  * @LastEditTime : 2021-09-27 14:20:00
  * @FilePath     : \showroom_editor\src\ui\datgui\ComponentLibs.ts
  */
export class ComponentLibs {
    private static _instanced: LibManager;

    constructor() {
    }

    static get Instanced(): LibManager {
        if (!ComponentLibs._instanced)
            ComponentLibs._instanced = new LibManager();
        return ComponentLibs._instanced;
    }


    static createFromJson(str: string, entity?: Entity): Promise<any> {
        if (!str)
            return Promise.resolve(null);
        const json = JSON.parse(str);
        const components: any = json.components;
        if (!components)
            return Promise.resolve(null);

        const coms = components.filter((com: any) => !!com).map((com: { component: any; data: any; }) => {
            const Clazz = this._instanced.get(com.component);
            if (!Clazz) {
                console.error(Clazz);
                return;
            }
            const component: Component<any> = new Clazz.Class(entity);
            component.fromJSON(com.data);
            component.buildSelfAccessor();
            component.fromJSONAfter();
            return component;

        });

        return Promise.all(coms);
    }


}
