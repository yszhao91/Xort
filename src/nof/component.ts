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

export abstract class Component {
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
        if (props !== false) {
            const schema = (this.constructor as any).schema;

            for (const key in schema) {
                if (props && props.hasOwnProperty(key)) {
                    (this as any)[key] = (props as any)[key];
                } else {
                    const schemaProp = schema[key];
                    if (schemaProp.hasOwnProperty("default")) {
                        (this as any)[key] = schemaProp.type.clone(schemaProp.default);
                    } else {
                        const type = schemaProp.type;
                        (this as any)[key] = type.clone(type.default);
                    }
                }
            }

            if (process.env.NODE_ENV !== "production" && props !== undefined) {
                this.checkUndefinedAttributes(props);
            }
        }
    }

    copy(source: Component) {
        const schema = (this.constructor as any).schema;

        for (const key in schema) {
            const prop = schema[key];

            if (source.hasOwnProperty(key)) {
                (this as any)[key] = prop.type.copy((this as any)[key], (this as any)[key]);
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