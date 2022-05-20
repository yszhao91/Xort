import { IStringDictionary, Undefinable, isUndefNull } from '../utils/types';
import { Asset } from './asset';
import { Entity, IRunEvent } from "./entity";
import { Thing, IDescriptor } from './thing';
import { ITimer } from './timer';


export interface IComponent extends IRunEvent {
    isSingle: boolean;
    needsUpdate: boolean;
    ioe: number;// index of Entity 在实体组件数组中的位置
    entity: Undefinable<Entity>;
    nextStep: Function;
    onChange?: Function;
    update?: (handler?: any) => any;
    execute?: Function; //所有的组件更新以后，总体执行每个组件，方便获取其他组件的数据
}

export interface IComponentOption {
    entity?: Entity;
    type?: string;
    isSingle?: boolean;
    accessors?: IStringDictionary<any> | string[]
}


export abstract class Component<T extends Asset> extends Thing implements IComponent {
    entity: Undefinable<Entity>;

    //最终生成的目标对象
    protected _object: any;

    /**
     * 此属性是否将资源的属性在组件中解释
     * 比如材质是false  那么材质的属性指点点击关联的材质，才会显示材质的相应属性
     * 而相机为true ,就是在属性面板直接显示资源的属性在inspector
     */
    inspectorAsset: boolean = true;
    /**
     * 关联的资源
     */
    _asset: Undefinable<T | T[]>;

    /**
     * 是否只允许存在一个
     */
    isSingle: boolean = false;

    /**
     * Index of Entity 在实体组件数组中的位置
     */
    ioe: number = -1;

    label: string = '组件'; //显示到设备的最终名字
    constructor(protected options?: IComponentOption) {
        super();

        this.entity = options?.entity;
        this.isSingle = options?.isSingle || false;

        this.init();
    }

    init() {
        this.on('change', (descriptor?: IDescriptor, value?: any) => {
            this.onChange && this.onChange(descriptor, value);
        })
    }

    onChange(_descriptor?: IDescriptor, _value?: any) {

    };


    get needsUpdate() {
        return this._needsUpdate;
    }

    set needsUpdate(bool: boolean) {
        if (bool !== this._needsUpdate && this.entity)
            this.entity.needsUpdate = this._needsUpdate = bool;
    }

    get object() {
        return this._object;
    }

    set object(val: any) {
        if (val !== this._object) {
            this._object = val;
        }
    }

    removeFromEntity() {
        return this.entity?.removeComponent(this);
    }

    toJSONPre() {
        const json = {
            component: this.constructor.name,
        }
        return json;
    }

    toJSON(): any {
        const that = this;
        const desclones = this.descriptors.map((v: IDescriptor) => {
            const des = { ...v };

            delete des['ecomponent'];

            if (des.host === that.entity)
                des.host = 'entity';
            else if (des.host === that)
                des.host = 'this';

            // if (des.value && !isUndefNull(des.value.id)) {
            //     des.value = { id: des.value.id };
            // }

            return des;
        });
        ``

        const json = {
            component: this.constructor.name,
            data: desclones
        }

        return json;
    }

    fromJSON(json: any) {
        this.descriptors = json;
        this.descriptors.forEach(v => {
            if (v.host === 'entity')
                v.host = this.entity;
            else
                v.host = this;

            v.ecomponent = this;
        });

        this.buildAccessors(this.descriptors);
        return this;
    }

    fromJSONAfter() {
        this.descriptors.forEach(v => {
            if (v.host && !isUndefNull(v.value))
                try {
                    v.host[v.attr || v.name] = v.value;
                } catch (error) {
                    debugger
                }
        });
    }

    beforeupdate() {

    }

    afterupdate() {

    }

    nextStep(xort: any, _entity?: Entity) {
        if (!this._needsUpdate)
            return;

        this.afterupdate();

        //存在更新
        this.update();

        this._needsUpdate = false;

        this.beforeupdate();
    }

    update(_option?: any): any {
        if (!this.needsUpdate)
            return;

    }

}


