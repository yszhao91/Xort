import { Xort } from '../xort';
import { BaseManager } from './baseManager';
import { XortScene } from '../scene';
import { XortEntity } from '../entity';


export interface IRenderObject {
    entity: XortEntity;
    geometry: any;
    material: any;
    renderOrder: number;
}

export class RenderObjectMananger extends BaseManager {
    opaque: XortEntity[] = [];
    transparent: XortEntity[] = [];
    items: XortEntity[] = [];
    constructor(xort: Xort) {
        super(xort)
    }

    leveltraverse(entity: XortEntity) {
        for (let i = 0; i < entity.children.length; i++) {
            const child = entity.children[i] as XortEntity;
            this.items.push(child);
            this.leveltraverse(child);
        }
    }

    load(scene: XortScene): any {
        this.leveltraverse(scene as unknown as XortEntity);
        this.opaque = this.items.filter((v: any) => v.material.transparent);
        this.transparent = this.items.filter((v: any) => !v.material.transparent);
    }

    dispose() {
        super.dispose()
    }
}



export function painterSortStable(a: { groupOrder: number; renderOrder: number; material: { id: number; }; z: number; id: number; }, b: { groupOrder: number; renderOrder: number; material: { id: number; }; z: number; id: number; }) {

    if (a.groupOrder !== b.groupOrder) {

        return a.groupOrder - b.groupOrder;

    } else if (a.renderOrder !== b.renderOrder) {

        return a.renderOrder - b.renderOrder;

    } else if (a.material.id !== b.material.id) {

        return a.material.id - b.material.id;

    } else if (a.z !== b.z) {

        return a.z - b.z;

    } else {

        return a.id - b.id;

    }

}

export function reversePainterSortStable(a: { groupOrder: number; renderOrder: number; z: number; id: number; }, b: { groupOrder: number; renderOrder: number; z: number; id: number; }) {

    if (a.groupOrder !== b.groupOrder) {

        return a.groupOrder - b.groupOrder;

    } else if (a.renderOrder !== b.renderOrder) {

        return a.renderOrder - b.renderOrder;

    } else if (a.z !== b.z) {

        return b.z - a.z;

    } else {

        return a.id - b.id;

    }

}
