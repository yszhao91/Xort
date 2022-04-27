/*
 * @Description  : 场景 用来装载管理一个特定场景，场景包含多个Entity
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-09-08 16:11:00
 * @LastEditTime : 2021-09-15 14:57:58
 * @FilePath     : \dc_editord:\codeup\object_frame\src\core\scene.ts
 */


import { ITimer } from "./timer";
import { Entity } from "./entity";

export class Scene extends Entity {
    constructor(option?: any) {
        super(option);
    }

    //API   
    nextStep(timer: ITimer) {
        for (let len = this.children.length, i = 0; i < len; i++) {
            const entity: Entity = this.children[i] as Entity;
            entity.nextStep(timer);
        }
    }
}
