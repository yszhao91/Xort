import { EntityManager } from "./entityManager";
import { Undefinable, IStringDictionary } from '../cga/utils/types';
import { Component } from "./component";
import { EntityPool } from "./entityPool";
import wrapImmutableComponent from "./wrapImmutableComponent";
import { QueryAction, Query } from './query';
import { UUID } from "./utils/uuid";
import { Thing } from "./utils/thing";

export class Entity extends Thing {
    private _entityManager: EntityManager;
    _components: any;
    id: any;
    _componentTypes: any[];
    _componentsToRemove: any;
    queries: Query[];
    _ComponentTypesToRemove: Partial<Component>[];
    alive: boolean;
    numStateComponents: number;
    _pool: Undefinable<EntityPool>;
    results: any;
    cache: IStringDictionary<any> = {};

    constructor(entityManager: EntityManager) {
        super();
        this._entityManager = entityManager;

        // Unique ID for this entity
        this.id = UUID.Instanced.getID('entity');

        // List of components types the entity has
        this._componentTypes = [];

        // Instance of the components
        this._components = {};

        this._componentsToRemove = {};

        // Queries where the entity is added
        this.queries = [];

        // Used for deferred removal
        this._ComponentTypesToRemove = [];

        this.alive = false;

        //if there are state components on a entity, it can't be removed completely
        this.numStateComponents = 0;
    }

    // COMPONENTS 
    getRemovedComponent(Component: { _typeId: string | number; }) {
        const component = this._componentsToRemove[Component._typeId];

        return process.env.NODE_ENV !== "production"
            ? wrapImmutableComponent(Component, component)
            : component;
    }

    get Components() {
        return this._components;
    }

    getComponentsToRemove() {
        return this._componentsToRemove;
    }

    getComponentTypes() {
        return this._componentTypes;
    }

    getComponent(Component: any, includeRemoved?: boolean) {
        var component = this._components[Component._typeId];

        if (!component && includeRemoved === true) {
            component = this._componentsToRemove[Component._typeId];
        }

        return process.env.NODE_ENV !== "production"
            ? wrapImmutableComponent(Component, component)
            : component;
    }

    getMutableComponent(ComClass: any) {
        var component = this._components[ComClass._typeId];

        if (!component) {
            return;
        }

        for (var i = 0; i < this.queries.length; i++) {
            var query: any = this.queries[i];
            // TODO accelerate this check. Maybe having query._Components as an object
            // TODO add Not components
            if (query.reactive && query.Components.indexOf(ComClass) !== -1) {
                query.on(
                    QueryAction.COMPONENT_CHANGED,
                    this,
                    component
                );
            }
        }
        return component;
    }

    addComponent(Component: any, values?: any): Component | undefined {
        return this._entityManager.entityAddComponent(this, Component, values);
    }

    removeComponent(Component: any, forceImmediate: boolean) {
        this._entityManager.entityRemoveComponent(this, Component, forceImmediate);
        return this;
    }

    hasComponent(Component: any, includeRemoved?: boolean) {
        return (
            !!~this._componentTypes.indexOf(Component) ||
            (includeRemoved === true && this.hasRemovedComponent(Component))
        );
    }

    hasRemovedComponent(Component: Partial<Component>) {
        return !!~this._ComponentTypesToRemove.indexOf(Component);
    }

    hasAllComponents(Components: string | any[]) {
        for (var i = 0; i < Components.length; i++) {
            if (!this.hasComponent(Components[i])) return false;
        }
        return true;
    }

    hasAnyComponents(Components: string | any[]) {
        for (var i = 0; i < Components.length; i++) {
            if (this.hasComponent(Components[i])) return true;
        }
        return false;
    }

    removeAllComponents(forceImmediate: boolean) {
        return this._entityManager.entityRemoveAllComponents(this, forceImmediate);
    }

    copy(src: Entity): Entity {
        // TODO: This can definitely be optimized
        for (var ecsyComponentId in src._components) {
            var srcComponent = src._components[ecsyComponentId];
            this.addComponent(srcComponent.constructor);
            var component = this.getComponent(srcComponent.constructor);
            component.copy(srcComponent);
        }

        return this;
    }

    clone(): Entity {
        return new Entity(this._entityManager).copy(this);
    }

    reset() {
        this.id = UUID.Instanced.getID('entity');
        this._componentTypes.length = 0;
        this.queries.length = 0;

        for (var ecsyComponentId in this._components) {
            delete this._components[ecsyComponentId];
        }
    }

    /**
     * 移除自身
     * @param forceImmediate 
     * @returns 
     */
    byRemove(forceImmediate: boolean = false) {
        return this._entityManager.removeEntity(this, forceImmediate);
    }
}