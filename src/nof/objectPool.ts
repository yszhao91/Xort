
export class ObjectPool {
    freeList: any = [];
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
        if (this.freeList.length <= 0) {
            this.expand(Math.round(this.count * 0.2) + 1);
        }

        var item = this.freeList.pop();

        return item;
    }

    release(item: { reset: () => void }) {
        item.reset();
        this.freeList.push(item);
    }

    expand(count: number) {
        for (var n = 0; n < count; n++) {
            var clone = new this.Clazz();
            clone._pool = this;
            this.freeList.push(clone);
        }
        this.count += count;
    }

    get totalSize(): number {
        return this.count;
    }

    get totalFree(): number {
        return this.freeList.length;
    }

    get totalUsed(): number {
        return this.count - this.freeList.length;
    }
}