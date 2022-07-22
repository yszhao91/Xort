
import { ComponentManager } from "./componentManager";
import { Entity } from "./entity";
import { EntityManager } from "./entityManager";
import { SystemManager } from "./systemManager";
import { Component } from "./component.js";
import { EventHandler } from '../cga/render/eventhandler';
import { ITimer, Timer } from "./utils/timer";
import { GraphicDevice } from '../bim/graphicdevice';

const DEFAULT_OPTIONS = {
    entityPoolSize: 0,
    entityClass: Entity,
};
export interface IWorldOption {
    entityPoolSize?: number;
    entityClass?: any;
}

export class World extends EventHandler {
    options: IWorldOption;
    enabled: boolean;
    componentsManager: ComponentManager;
    entityManager: EntityManager;
    systemManager: SystemManager;
    eventQueues: {};
    lastTime: number;
    timer: ITimer;
    //temp
    gd: GraphicDevice;

    constructor(options: IWorldOption = {}) {
        super(); 
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);

        this.componentsManager = new ComponentManager(this);
        this.entityManager = new EntityManager(this);
        this.systemManager = new SystemManager(this);

        this.enabled = true;

        this.eventQueues = {};

        this.timer = new Timer();

        if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
            this.fire("ecsy-world-created", { detail: { world: this, version: '0.0.1-pre' } });
        }

        this.lastTime = this.timer.elapsed;
    }

    registerComponent(Component: any, objectPool?: any) {
        this.componentsManager.registerComponent(Component, objectPool);
        return this;
    }

    registerSystem(System: any, attributes?: any) {
        this.systemManager.registerSystem(System, attributes);
        return this;
    }

    hasRegisteredComponent<T extends Component>(Component: T) {
        return this.componentsManager.hasComponent(Component);
    }

    unregisterSystem(System: any) {
        this.systemManager.unregisterSystem(System);
        return this;
    }

    getSystem(SystemClass: any) {
        return this.systemManager.getSystem(SystemClass);
    }

    getSystems() {
        return this.systemManager.Systems;
    }

    execute() {
        if (this.enabled) {
            this.systemManager.execute(this.timer);
            this.entityManager.processDeferredRemoval();
        }
    }

    stop() {
        this.enabled = false;
    }

    play() {
        this.enabled = true;
    }

    createEntity(name?: any) {
        return this.entityManager.createEntity(name);
    }

    stats() {
        var stats = {
            entities: this.entityManager.stats(),
            system: this.systemManager.stats(),
        };

        return stats;
    }
}
