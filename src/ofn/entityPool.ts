import { EntityManager } from './entityManager';
import { ObjectPool } from './objectPool';
export class EntityPool extends ObjectPool {

    constructor(private entityManager: EntityManager, entityClass: any, initialSize?: number) {
        super(entityClass, undefined);

        if (typeof initialSize !== "undefined") {
            this.expand(initialSize);
        }
    }

    expand(count: number) {
        for (var n = 0; n < count; n++) {
            var clone = new this.Clazz(this.entityManager);
            clone._pool = this;
            this.container.push(clone);
        }
        this.count += count;
    }


}