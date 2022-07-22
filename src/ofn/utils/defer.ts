export class Defer {
    promise: Promise<any>;
    private _resolve!: (value: any) => void;
    private _reject!: (reason?: any) => void;
    constructor() {
        const that = this;
        this.promise = new Promise((resolve, reject) => {
            that._resolve = resolve;
            that._reject = reject;
        });
    }
    resolve(data: any) {
        this._resolve(data);
    }

    reject(data: any) {
        this._reject(data);
    }
} 