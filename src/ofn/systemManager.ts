import { World } from "./world";
import { System } from './system';
import { Undefinable } from '../cga/utils/types';  
import { ITimer } from "./utils/timer";

export class SystemManager {
    private _executeSystems: Array<System> = [];
    lastExecutedSystem: Undefinable<System>;
    private _systems: Array<System> = [];

    constructor(private world: World) {

    }
    execute(timer: ITimer, forcePlay: boolean = false) { 
        this._executeSystems.forEach(
            (system: any) =>
                (forcePlay || system.enabled) && this.executeSystem(system, timer)
        );
    }
    executeSystem(system: System, timer: ITimer) {
        if (system.initialized) {
            if (system.canExecute()) {
                system.execute(timer);
                this.lastExecutedSystem = system;
                system.clearEvents();
            }
        }
    }

    registerSystem(SystemClass: any, attributes: any) {
        if (!SystemClass.isSystem) {
            throw new Error(
                `System '${SystemClass.name}' does not extend 'System' class`
            );
        }

        if (this.getSystem(SystemClass) !== undefined) {
            console.warn(`System '${SystemClass.getName()}' already registered.`);
            return this;
        }

        var system: System = new SystemClass(this.world, attributes);
        if (system.init) system.init(attributes);
        system.order = this._systems.length;
        this._systems.push(system);
        system.order = this._systems.length;

        // if (system.execute) 
        this._executeSystems.push(system);
        this.sortSystems();

        return this;
    }

    getSystem(SystemClass: any) {
        return this._systems.find((s: any) => s instanceof SystemClass);
    }

    sortSystems() {
        this._executeSystems.sort((a: any, b: any) => {
            return a.priority - b.priority || a.order - b.order;
        });
    }
    
    unregisterSystem(SystemClass: any) {
        let system = this.getSystem(SystemClass);
        if (system === undefined) {
            console.warn(
                `Can unregister system '${SystemClass.getName()}'. It doesn't exist.`
            );
            return this;
        }

        this._systems.splice(this._systems.indexOf(system), 1);

        // if (system.execute) {
        this._executeSystems.splice(this._executeSystems.indexOf(system), 1);
        // }

        //@TODO 添加 system.unregister() 方法去释放资源
        return this;
    }

    get Systems() {
        return this._systems;
    }

    stats() {
        throw new Error("Method not implemented.");
    }

}