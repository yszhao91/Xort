export class ObjectPool {
    container: any[] = [];
    count: number = 0;
    Clazz: any;
    isObjectPool: boolean = true;
    constructor(Clazz: any, initialSize?: number) {
        this.Clazz = Clazz;

        if (typeof initialSize !== "undefined") {
            this.expand(initialSize);
        }
    }

    acquire() {
        // 20%比例增加新的实体
        if (this.container.length <= 0) {
            this.expand(Math.round(this.count * 0.2) + 1);
        }

        var item = this.container.pop();

        return item;
    }

    release(item: { reset: () => void }) {
        item.reset();
        this.container.push(item);
    }

    expand(count: number) {
        for (var n = 0; n < count; n++) {
            var clone = new this.Clazz();
            clone._pool = this;
            this.container.push(clone);
        }
        this.count += count;
    }

    get size(): number {
        return this.count;
    }

    get freeSize(): number {
        return this.container.length;
    }

    get usedSize(): number {
        return this.count - this.container.length;
    }
}