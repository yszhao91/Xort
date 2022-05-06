import { Thing } from "./thing";
import { IComponent, Component } from './component';
import { Undefinable, Nullable } from '../utils/types';
import { ITimer } from "..";
import { UUID } from './uuid';
import { ComponentLibs } from "../extends/componentLib";
import { Xort } from '../../core/xort';
export interface IObjectAdapter {
    createHostObject: Function;
}

export interface IEntityOptions {
    nonDefaultComponent?: boolean,
    objectAdapter?: IObjectAdapter;
    [key: string]: any;
}

export interface IRunEvent {
    init: Function;
    beforeupdate: Function;
    afterupdate: Function;
}

/**
 * 场景的编译，当改变属性的时候应该实时的更新模型的属性状态，最终编译的时候已经转换到THREE
 * entity下的object是固定的Object3D，当他的组件形成构成新的模型都是放在object3d
 * Component下的renderObject是变动的模型，大部分和ctype相关
 */
export abstract class Entity extends Thing implements IRunEvent {
    _components: IComponent[] = [];
    _componentMap: Map<any, IComponent | IComponent[]> = new Map();
    objectAdapter: Undefinable<IObjectAdapter>;
    private _object: any;

    _compileCache: any = {};
    xort!: Xort;
    //是否需要更新  

    constructor(options: IEntityOptions = {}) {
        super(options);

        this.name = UUID.Instanced.getID('实体_', true) as string;

        this.objectAdapter = options.objectAdapter;
        if (this.objectAdapter)
            this.object = this.objectAdapter.createHostObject();

        this.init();
    }

    get object() {
        return this._object;
    }

    set object(val) {
        if (val !== this.object) {
            this._object = val;
            this.needsUpdate = true;
        }
    }

    init() {
        //TODO 接口
    }

    get components() {
        return this._components;
    }

    get componentsJson() {
        const result = [];

        for (let i = 0; i < this.components.length; i++) {
            const com: Component<any> = this.components[i] as any;
            result.push({
                component: com.constructor.name,
                data: com.toJSON(),
            });
        }
        return JSON.stringify(result);
    }

    set componentsJson(text: string) {
        const coms = JSON.parse(text);
        for (let i = 0; i < coms.length; i++) {
            const com = coms[i];
            const ComClass = ComponentLibs.Instanced.get(com.key);
            if (ComClass) {

            }
        }
    }

    /**
     * 
     * @param componentName 
     * @returns 
     */
    getComponentByName(componentName: string) {
        for (let i = 0; i < this._components.length; i++) {
            const cls = this._components[i];
            if (cls.constructor.name === componentName)
                return cls;
        }
    }

    getComponentByNames(componentName: string) {
        const res = [];
        for (let i = 0; i < this._components.length; i++) {
            const cls = this._components[i];
            if (cls.constructor.name === componentName)
                res.push(cls);
        }
        return res;
    }

    /**
     * 添加组件 
     * @param com 组件
     * @returns 是否添加成功
     */
    addComponent(com: IComponent | Component<any>): boolean {
        com.entity = this;
        // const i = this._components.map(v => v.const).indexOf(com);
        const coms = this.getComponentByNames(com.constructor.name)

        if (coms.length <= 0 || (coms.length >= 0 && !com.isSingle)) {
            this._components.push(com);
            com.ioe = this._components.length - 1;

            if (com.isSingle)
                this._componentMap.set((com as Component<any>).className, com)
            else {
                if (!this._componentMap.has((com as Component<any>).className))
                    this._componentMap.set((com as Component<any>).className, [com])
                else
                    (this._componentMap.get((<Component<any>>com).className) as Array<IComponent>).push(com)
            }
            (com as Component<any>).fire('addToEntity', this);

            if (this.xort)
                this.xort.fire('onAddComponent', com);
            return true;
        } else {
            return false;
        }

    }

    removeComponent(com: IComponent): Nullable<IComponent> {
        const i = this._components.indexOf(com);
        let removeObj = null;
        if (i >= 0) {
            if (com.isSingle)
                this._componentMap.delete((com as Component<any>).className);
            else {
                const coms: Array<IComponent> = this._componentMap.get((com as Component<any>).className) as Component<any>[]
                if (coms.length > 1) {
                    const ci = coms.indexOf(com);
                    if (ci !== -1)
                        removeObj = coms.splice(ci, 1)[0];
                }
                else {
                    removeObj = (this._componentMap.get((com as Component<any>).className) as any)[0];
                    this._componentMap.delete((com as Component<any>).className);
                }
            }

            removeObj = this._components.splice(i, 1)[0];
            (com as Component<any>).fire('removeToEntity', this);
        }
        if (this.xort)
            this.xort.fire('onRemoveComponent', removeObj)
        return removeObj;
    }

    updateComponents() {
        for (let i = 0; i < this._components.length; i++) {
            const component: IComponent = this._components[i];
            component.nextStep(this);
        }
    }

    /**
     * 最新定位:保持更新，运行相应程序
     * @param timer 
     */
    update(timer: ITimer) {
        for (let i = 0; i < this._components.length; i++) {
            const component: IComponent = this._components[i];
            if (component.update)
                component.update(timer);
        }
    }

    /**
     * 最新定位，有改动就编译实体
     * @param timer 
     * @returns 
     */
    nextStep(timer: ITimer) {
        /**
         * 混合(更新/执行)所有组件
         * 此时的update中 entity的所有组件已经完成编译
         * 可以在update中进行操作
         */
        this.update(timer);

        if (!this.needsUpdate)
            return;

        for (let i = 0; i < this.children.length; i++) {
            const child: any = this.children[i];
            child.nextStep(timer);
        }

        //先全部更新所有组件
        this.updateComponents();

        //只是针对当前场景
        this.beforeupdate();


        this.needsUpdate = false;
    }


    unload() {
        const parent: Entity = this.parent as Entity;
        if (parent) {
            this.parent.remove(this);
            parent.object.remove(this.object);
        }
    }

    // 接口
    onInit() {
        if (this.object.init)
            this.object.init();
    }

    onKeyDown() {

    }

    onKeyUp() {

    }

    onMouseUp() {

    }
    onMouseDown() {

    }
    onUpdate() {

    }
    beforeupdate() { }
    afterupdate() { }
}