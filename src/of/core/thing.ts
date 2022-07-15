import { Nullable, isDefined, isUndefNull, isNoObject } from '../utils/types';
import { EventHandler } from './eventhandler';
import { UUID } from './uuid';


export abstract class Thing extends EventHandler {
  uuid: string = UUID.unique;
  id: string | number = UUID.Instanced.getID('thing');
  name: string = "";
  isThing: true = true;
  parent: Nullable<Thing> = null;
  children: Thing[] = [];
  tag: string = "untagged";
  userData: any = {};
  userProps: any = {};
  // accessors
  descriptors: IDescriptor[] = [];
  private _level: number = 0; //当前所在的层级

  //是否需要更新
  protected _needsUpdate: boolean = true;

  constructor(opts?: any) {
    super();
    opts = opts || {};
    this.name = opts.name || "";

    this.on("set", (name: string, oldValue: any, newValue: any) => {
      this.fire("set_" + name, oldValue, newValue);
    });

    for (const key in opts) {
      if (opts.hasOwnProperty(key)) {
        if (!(this as any)[key]) {
          (this as any)[key] = opts[key];
        }
      }
    }
  }

  set needsUpdate(v: boolean) {
    if (v === this._needsUpdate)
      return;
    this._needsUpdate = v;
    if (this.parent && v)
      this.parent.needsUpdate = v;
  }

  get needsUpdate(): boolean {
    return this._needsUpdate
  }

  /**
   * 获取当前对象的类型
   */
  get className() {
    return this.constructor.name;
  }
 

  get level(): number {
    return this._level;
  }

  /**
   * 设置层级  主动更新子节点level
   */
  set level(v: number) {
    this._level = v;
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].level = v + 1;
    }
  }

  add<T extends Thing>(...things: Thing[] | T[]) {
    if (things.length > 1) {
      for (var i = 0; i < things.length; i++) {
        this.add(things[i]);
      }
      return this;
    }
    if (things[0] === this) {
      console.error("Thing.add: 自己不能作为自己的子节点", things[0]);
      return this;
    }
    if (things[0] && this.isThing) {
      ``
      if (things[0].parent) {
        things[0].parent.remove(things[0]);
      }

      things[0].parent = this;
      this.children.push(things[0]);

      things[0].level = this.level + 1;

    } else {
      console.error("Thing.add:不是Thing类型", things[0]);
    }
    return this;
  }

  remove(...things: Thing[]) {
    if (things.length > 1) {
      for (var i = 0; i < things.length; i++) {
        this.remove(things[i]);
      }
      return this;
    } else {
      //自身从父节点移除
      if (this.parent)
        this.parent.remove(this);
    }

    var ipos = this.children.indexOf(things[0]);

    if (ipos !== -1) {
      things[0].parent = null;
      this.children.splice(ipos, 1);
      things[0].level = 0;
    }

    return this;
  }

  /**
   * @description :  遍历所有对象
   * @param        {(obj:any)=>void} cb 回掉方法
   * @return       {*}
   * @example     : 
   */
  foreach(cb: (arg0: any) => void) {
    cb(this);
    const children = this.children;
    for (let i = 0; i < children.length; i++) {
      children[i].foreach(cb);
    }
  }

  /**
   * 遍历一级子节点
   * @param cb 
   */
  foreachChildren(cb: (arg0: any) => void) {
    const children = this.children;
    for (let i = 0; i < children.length; i++) {
      cb(children[i]);
    }
  }

  getObjectByProperty<T extends Thing>(name: string, value: any): T | Thing | undefined {

    if ((this as any)[name] === value) return this;

    for (var i = 0, l = this.children.length; i < l; i++) {

      var child = this.children[i];
      if (!child.getObjectByProperty)
        continue
      var object = child.getObjectByProperty(name, value);

      if (object !== undefined) {
        return object;
      }
    }

    return undefined;

  }

  /**
   * @description : 通过id获得对象
   * @param        {string} id
   * @return       {*}
   * @example     : 
   */
  getObjectById(id: string) {
    return this.getObjectByProperty('id', id);
  }

  /**
   * @description :  通过name获得对象
   * @param        {string} name
   * @return       {*}
   * @example     : 
   */
  getObjectByName(name: any) {
    return this.getObjectByProperty('name', name);
  }

  /**
   * 生成属性的set/get方法
   * @param {string} name 
   * @param {function} setFunc 
   * @param {boolean} skipEqualsCheck 
   */
  defineProperty(name: string | number | symbol, setFunc: any, skipEqualsCheck = true) {
    Object.defineProperty(this, name, {
      get: () => {
        return this.userProps[name];
      },
      set: (value) => {
        var data = this.userProps;
        var oldValue = data[name];
        if (!skipEqualsCheck && oldValue === value) return;
        data[name] = value;
        if (setFunc) setFunc.call(this, value, oldValue);
      },
      configurable: true
    })
  }


  //Extends  生成自定义的get/set属性
  buildAccessor<T extends Thing>(descriptor: IDescriptor, bindObject: T = this as any) {
    if (!bindObject)
      return

    if (this.descriptors.indexOf(descriptor) == -1)
      this.descriptors.push(descriptor);

    let name = descriptor.name;
    let assignment = descriptor.assignment || 'copy';

    let targetObject = bindObject as any;

    targetObject[`_${name}`] = descriptor.value;

    Object.defineProperty(targetObject, name, {
      get: function () {
        return targetObject[`_${name}`];
      },
      set: function (value) {
        var oldValue = targetObject[`_${name}`];
        if (isNoObject(value) || isUndefNull(oldValue))
          targetObject[`_${name}`] = value;
        else if (!isUndefNull(targetObject[`_${name}`][assignment]))
          targetObject[`_${name}`][assignment](value);
        else
          targetObject[`_${name}`] = value;
        targetObject.fire('set', `${name}`, oldValue, value);
      },
      configurable: true
    });

    //如果有默认数值
    if (isDefined(descriptor.defaultValue))
      targetObject[`${name}`] = descriptor.defaultValue;
  }

  buildAccessors<T extends Thing>(schema: IDescriptor[], bindObject?: T) {
    schema.forEach((descriptor: any) => {
      this.buildAccessor(descriptor, bindObject)
    });
  }

  /**
   * 如果存在描述性的附加属性，可以去构建
   */
  buildSelfAccessor() {
    if (this.descriptors)
      this.buildAccessors(this.descriptors);
  }

  toJSON?: () => string;

  fromJSON?: (json: any) => any;

  static fromJSON(json: any): any {
    const res = (this as any).constructor();
    res.fromJSON(json)
    return res;
  }

}

/**
 * 解释性属性的接口
 * 不允许出现js对象结构，
 * 要分解成为基本类型
 */
export interface IDescriptor {
  name: string; //变量名称
  host?: 'entity' | 'self' | any | { guid: string };//主体 默认是自身this
  attr?: string; //是哪一个属性
  component?: string | any, //对应组件类型
  ecomponent?: any, //对应组件类型
  value?: any;
  comment?: string; //'间距',
  label?: string; //对外显示标签
  assignment?: string, //复制符号
  description?: string; //描述
  defaultValue?: any; //默认值
  array?: any[];//如果是数组
  revealParamters?: any;//主要是脚本的属性使用
  count?: number;
  template?: IDescriptor | IDescriptor[],//数组中使用的模板
  optionItems?: any,//选项
  loader?: any,//如果是文件是否需要定义加载器
  fileType?: string;//如果是文件文件选择就要提供类型
}

