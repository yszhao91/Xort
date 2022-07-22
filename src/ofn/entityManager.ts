import { EntityPool } from "./entityPool";
import { World } from "./world";
import { Entity } from './entity';
import { Querymanger } from './queryManager';
import { Query } from './query';
import { SystemStateComponent } from "./systemStateComponent";
import { Component } from "./component";

export enum EnityAction {
    CREATED = "EntityManager#ENTITY_CREATE",
    REMOVED = "EntityManager#ENTITY_REMOVED",
}

export enum ComponetAction {
    ADDED = "EntityManager#COMPONENT_ADDED",
    CHANGE = "EntityManager#COMPONENT_CHANGE",
    REMOVE = "EntityManager#COMPONENT_REMOVE",
}

export class EntityManager {
    _entities: any = [];
    private _entityPool: EntityPool;
    private _entitiesByNames: any = {};
    private _queryManager: Querymanger;
    entitiesToRemove: any;
    entitiesWithComponentsToRemove: Entity[] = [];
    deferredRemovalEnabled: any;

    constructor(private world: World) {

        this._queryManager = new Querymanger(this);

        this._entityPool = new EntityPool(this, this.world.options.entityClass, this.world.options.entityPoolSize);

    }

    createEntity(name: string = '') {
        var entity: Entity = this._entityPool.acquire();
        entity.alive = true;
        entity.name = name || "";
        if (name) {
            if (this._entitiesByNames[name]) {
                console.warn(`Entity name '${name}' already exist`);
            } else {
                this._entitiesByNames[name] = entity;
            }
        }

        this._entities.push(entity);
        this.world.fire(EnityAction.CREATED, entity);
        return entity;
    }


    removeEntity(entity: Entity, immediately: boolean) {
        var index = this._entities.indexOf(entity);

        if (!~index) throw new Error("Tried to remove entity not in list");

        entity.alive = false;
        this.entityRemoveAllComponents(entity, immediately);

        if (entity.numStateComponents === 0) {
            // Remove from entity list
            this.world.fire(ComponetAction.REMOVE, entity);
            this._queryManager.onEntityRemoved(entity);
            if (immediately === true) {
                this._releaseEntity(entity, index);
            } else {
                this.entitiesToRemove.push(entity);
            }
        }

    }

    entityRemoveAllComponents(entity: Entity, immediately: boolean) {
        let components = entity._componentTypes;

        for (let j = components.length - 1; j >= 0; j--) {
            if (components[j].__proto__ !== SystemStateComponent)
                this.entityRemoveComponent(entity, components[j], immediately);
        };
    }

    entityAddComponent(entity: Entity, ComponentClazz: any, values: any): Component | undefined {
        // @todo Probably define Component._typeId with a default value and avoid using typeof
        if (typeof ComponentClazz._typeId === "undefined" &&
            !this.world.componentsManager._componentsMap[ComponentClazz._typeId]) {
            throw new Error(
                `Attempted to add unregistered component "${ComponentClazz.getName()}"`
            );
        }

        if (~entity._componentTypes.indexOf(ComponentClazz)) {
            if (process.env.NODE_ENV !== "production") {
                console.warn(
                    "Component type already exists on entity.",
                    entity,
                    ComponentClazz.getName()
                );
            }
            return;
        }

        entity._componentTypes.push(ComponentClazz);

        if (ComponentClazz.__proto__ === SystemStateComponent) {
            entity.numStateComponents++;
        }

        var componentPool = this.world.componentsManager.getComponentsPool(
            ComponentClazz
        );

        var component: Component = componentPool
            ? componentPool.acquire()
            : new ComponentClazz(values);

        if (componentPool && values) {
            component.setAttrAccessor(values);
        }

        //事件反应到world
        component.on('change', (name: string, oldValue: any, newValue: any) => {
            this.world.fire(`${ComponetAction.CHANGE}#${component.constructor.name}`, component, name, oldValue, newValue);
        });

        entity._components[ComponentClazz._typeId] = component;

        this._queryManager.onEntityComponentAdded(entity, ComponentClazz);
        this.world.componentsManager.componentAddedToEntity(ComponentClazz);

        this.world.fire(ComponetAction.ADDED, entity, ComponentClazz);

        return component;
    }

    entityRemoveComponent(entity: Entity, component: any, immediately: boolean) {
        var index = entity._componentTypes.indexOf(component);
        if (!~index) return;

        this.world.fire(ComponetAction.REMOVE, entity, component);

        if (immediately) {
            this._entityRemoveComponentSync(entity, component, index);
        } else {
            if (entity._ComponentTypesToRemove.length === 0)
                this.entitiesWithComponentsToRemove.push(entity);

            entity._componentTypes.splice(index, 1);
            entity._ComponentTypesToRemove.push(component);

            entity._componentsToRemove[component._typeId] =
                entity._components[component._typeId];
            delete entity._components[component._typeId];
        }

        // Check each indexed query to see if we need to remove it
        this._queryManager.onEntityComponentRemoved(entity, component);

        if (component.__proto__ === SystemStateComponent) {
            entity.numStateComponents--;

            // Check if the entity was a ghost waiting for the last system state component to be removed
            if (entity.numStateComponents === 0 && !entity.alive) {
                entity.remove();
            }
        }
    }

    private _entityRemoveComponentSync(entity: Entity, component: any, index: number) {
        // Remove T listing on entity and property ref, then free the component.
        entity._componentTypes.splice(index, 1);
        var component = entity._components[component];
        delete entity._components[component._typeId];
        component.dispose();
        this.world.componentsManager.componentRemovedFromEntity(component);
    }


    private _releaseEntity(entity: Entity, index: any) {
        this._entities.splice(index, 1);

        if (this._entitiesByNames[entity.name]) {
            delete this._entitiesByNames[entity.name];
        }
        entity._pool?.release(entity);
    }

    processDeferredRemoval() {
        if (!this.deferredRemovalEnabled) {
            return;
        }

        for (let i = 0; i < this.entitiesToRemove.length; i++) {
            let entity = this.entitiesToRemove[i];
            let index = this._entities.indexOf(entity);
            this._releaseEntity(entity, index);
        }
        this.entitiesToRemove.length = 0;

        for (let i = 0; i < this.entitiesWithComponentsToRemove.length; i++) {
            let entity = this.entitiesWithComponentsToRemove[i];
            while (entity._ComponentTypesToRemove.length > 0) {
                let Component: any = entity._ComponentTypesToRemove.pop();

                var component = entity._componentsToRemove[Component._typeId];
                delete entity._componentsToRemove[Component._typeId];
                component.dispose();
                this.world.componentsManager.componentRemovedFromEntity(Component);

                //this._entityRemoveComponentSync(entity, Component, index);
            }
        }

        this.entitiesWithComponentsToRemove.length = 0;
    }

    queryComponents(ComClass: any[]): Query {
        return this._queryManager.getQuery(ComClass);
    }

    stats() {
        const stats = {};
        return stats;
    }
}