import { IStringDictionary, isUndefNull } from './types';
import { ITimer } from './utils/timer';
import { EventHandler } from '../cga/render/eventhandler';
// export type TypeCopyFunction<T> = (src: T, dest?: T) => T;
// export type TypeCloneFunction<T> = (value: T) => T;

export interface PropTypeDefinition<T, D> {
    name: string
    copy: Function
    default: D
    clone: Function
    isType?: true
}

export type ComponentSchemaProp = {
    default?: any;
    type: PropTypeDefinition<any, any>;
};

export type ComponentSchema = {
    [propName: string]: ComponentSchemaProp;
};

export interface IUpdate {
    update: (timer: ITimer) => void;
}

export abstract class Component extends EventHandler {
    /**
     * 组件需要的值
     */
    static schema: ComponentSchema = {};
    static _typeId: any;
    static isComponent: boolean = true;
    private _pool: any;
    static getName() {
        return this.name;
    }

    constructor(props?: Partial<Component> | false) {
        super();

        const schema = (this.constructor as any).schema;

        for (const name in schema) {
            let self = this as any;
            if (!self[`${name}`])
                Object.defineProperty(self, name, {
                    get: function () {
                        return self[`_${name}`];
                    },
                    set: function (value) {
                        var oldValue = self[`_${name}`];

                        self[`_${name}`] = value;

                        self.fire('set', `${name}`, oldValue, value);
                    },
                    configurable: true
                });
        }

        if (props) {
            for (const name in schema) {
                const prop = schema[name];
                (this as any)[`${name}`] = prop.type.copy((props as any)[name], (this as any)[name]);
            }
            if (process.env.NODE_ENV !== "production" && props !== undefined) {
                this.checkUndefinedAttributes(props);
            }
        }
    }


    setAttrAccessor(source: IStringDictionary<any>) {

        const schema = (this.constructor as any).schema;

        let self = this as any;

        for (const name in schema) {
            const prop = schema[name];
            if (source[name])
                self[`${name}`] = prop.type.copy((source as any)[name], (this as any)[name]);
        }

        // @DEBUG
        if (process.env.NODE_ENV !== "production") {
            this.checkUndefinedAttributes(source);
        }


        return this;
    }

    setAttribute(source: Component) {
        const schema = (this.constructor as any).schema;

        for (const key in schema) {
            const prop = schema[key];

            if (source.hasOwnProperty(key)) {
                (this as any)[key] = prop.type.copy((source as any)[key], (this as any)[key]);
            }
        }

        // @DEBUG
        if (process.env.NODE_ENV !== "production") {
            this.checkUndefinedAttributes(source);
        }

        return this;
    }

    clone() {
        return new (this as any).constructor().copy(this);
    }

    reset() {
        const schema = (this.constructor as any).schema;

        for (const key in schema) {
            const schemaProp = schema[key];

            if (schemaProp.hasOwnProperty("default")) {
                (this as any)[key] = schemaProp.type.copy(schemaProp.default, (this as any)[key]);
            } else {
                const type = schemaProp.type;
                (this as any)[key] = type.copy(type.default, (this as any)[key]);
            }
        }
    }

    dispose() {
        if (this._pool) {
            this._pool.release(this);
        }
    }

    getName() {
        return this.constructor.name;
    }

    checkUndefinedAttributes(src: any) {
        const schema = (this.constructor as any).schema;

        // Check that the attributes defined in source are also defined in the schema
        Object.keys(src).forEach((srcKey) => {
            if (!schema.hasOwnProperty(srcKey)) {
                console.warn(
                    `Trying to set attribute '${srcKey}' not defined in the '${this.constructor.name}' schema. Please fix the schema, the attribute value won't be set`
                );
            }
        });
    }

}