/**
 * @Description  : 空间方位，遵循父子层次节点矩阵继承
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-09-09 08:53:12
 * @LastEditTime : 2021-09-15 16:23:21
 * @FilePath     : \object_frame\src\extends\components\transform.ts
 * 
 * set 设置 在现有基础上改变
 * make 设置新数据  创建一个新对象
 * 
 */

import { Component, IComponentOption, MetaEntity } from "../../../of";
import { Vec3, Quat, Mat4, Euler, Mat3 } from "../../../cga"; 
import { ComponentLibs } from "../componentLib";
import { TransformSystem } from "../../system/Transform";


const _v1 = new Vec3();
const _q1 = new Quat();
const _m1 = new Mat4();
const _target = new Vec3();

const _position = new Vec3();
const _scale = new Vec3();
const _quaternion = new Quat();

const _xAxis = Vec3.UnitX;
const _yAxis = Vec3.UnitY;
const _zAxis = Vec3.UnitZ;

export interface ITransformComponent extends IComponentOption {
    position?: Vec3 | { x: number, y: number, z: number };
    rotation?: Euler | { x: number, y: number, z: number };
    scale?: Vec3 | { x: number, y: number, z: number };
}

export class TransformComponent extends Component<any> {
    _position: Vec3 = new Vec3;
    _rotation: Euler = new Euler;
    _scale: Vec3 = new Vec3(1, 1, 1);

    _quat: Quat = new Quat;
    _mat: Mat4 = new Mat4;
    _matWorld: Mat4 = new Mat4;
    _modelViewMat: Mat4 = new Mat4;
    _normalMat: Mat3 = new Mat3;
    _matWorldInverse: Mat4 = new Mat4;
    _target: Vec3 = new Vec3;

    up: Vec3 = new Vec3(0, 1, 0);
    right: Vec3 = new Vec3(1, 0, 0);
    front: Vec3 = new Vec3(0, 0, 1);

    /**
     * 物体是否需要更新世界矩阵
     */
    matWorldNeedsUpdate: boolean = true;

    /**
     * 自动更新矩阵
     */
    matAutoUpdate: boolean = true;
    [key: string]: any; 
    
    constructor(options?: ITransformComponent) {
        super(options) 
        TransformSystem.Register(this);
        
        this.descriptors = [
            { name: 'position', value: this._position, component: 'Vector', label: '位置' },
            { name: 'rotation', value: this._rotation, component: 'Vector', label: '旋转' },
            { name: 'scale', value: this._scale, component: 'Vector', label: '缩放' },
        ];
        this.isSingle = true;
        this.label = '方位';

        this.buildAccessors(this.descriptors, this);
        if (options) {
            options.position && this._position.copy(options.position as any);
            options.scale && this._scale.copy(options.position as any)
            options.rotation && this._rotation.copy(options.position as any)
        }
        this._rotation.on('change', () => {
            this._quat.setFromEuler(this._rotation, false);
            this.entity?.fire('change', this);
        })
        this._position.on('change', () => {
            this.entity?.fire('change', this);
        })
        this._scale.on('change', () => {
            this.entity?.fire('change', this);
        })
        this._quat.on('change', () => {
            this._rotation.setFromQuat(this._quat, undefined, false);
            this.entity?.fire('change', this);
        });
    }

    toJSON() {
        const json: any = this.toJSONPre();
        json.data = {
            position: this._position.toArray(),
            rotation: this._quat.toArray(),
            scale: this._scale.toArray(),
        }
        return json;
    }

    fromJSON(json: any): any {
        this._position.fromArray(json.position);
        this._quat.fromArray(json.rotation);
        this._rotation.setFromQuat(this._quat);
        this._scale.fromArray(json.scale);
        this.updateMat();

        this.descriptors.forEach(v => {
            v.host = this.entity;
            v.ecomponent = this;
        });
        return this;
    }

    /**
     * 更新自身矩阵
     */
    updateMat() {
        this._mat.compose(this._position, this._quat, this._scale);
        this.matWorldNeedsUpdate = true;
    }

    /**
     * 更新整体层次的世界矩阵
     * @param force  是否强制更新
     */
    updateMatWorld(force: boolean = false) {

        if (this.matAutoUpdate) this.updateMat();

        if (this.matWorldNeedsUpdate || force) {

            if (this.entity?.parent === null) {
                this._matWorld.copy(this._mat);
            } else {
                if (this.entity && this.entity.parent)
                    this._matWorld.multiplyMats((this.entity.parent as MetaEntity).transfrom._matWorld, this._mat);
            }

            this.matWorldNeedsUpdate = false;
            force = true;
        }

        // update children
        if (this.entity) {
            const children: MetaEntity[] = this.entity.children as MetaEntity[];

            for (let i = 0, l = children.length; i < l; i++) {
                children[i].transfrom.updateMatWorld(force);
            }
        }

    }

    /**
     * @description :  更新当前 世界矩阵
     * @param        {boolean} updateParents  是否更新父节点
     * @param        {boolean} updateChildren 是否更新子节点
     * @return       {*}
     * @example     : 
     */
    updateWorldMat(updateParents: boolean, updateChildren: boolean) {

        const parent = this.entity!.parent as MetaEntity;

        if (updateParents === true && parent !== null) {
            parent.transfrom.updateWorldMat(true, false);
        }

        if (this.matAutoUpdate) this.updateMat();

        if (this.entity!.parent === null) {
            this._matWorld.copy(this._mat);
        } else {
            this._matWorld.multiplyMats((this.entity!.parent as MetaEntity).transfrom._matWorld, this._mat);
        }

        // update children

        if (updateChildren === true && this.entity) {

            const children = this.entity.children as MetaEntity[];

            for (let i = 0, l = children.length; i < l; i++) {
                children[i].transfrom.updateWorldMat(false, true);
            }

        }

    }

    /**
     * 响应其他矩阵
     * @param mat4 
     */
    applyMat4(mat4: Mat4) {

        if (this.matAutoUpdate) this.updateMat();
        this._mat.premultiply(mat4);
        this._mat.decompose(this._position, this._quat, this._scale);

    }

    applyQuaternion(q: Quat) {

        this._quat.premultiply(q);
        return this;

    }

    setRotationFromAxisAngle(axis: Vec3, angle: number) {

        this._quat.setFromAxisAngle(axis, angle);

    }

    setRotationFromEuler(euler: Euler) {

        this._quat.setFromEuler(euler, true);

    }

    setRotationFromMat(m: Mat4) {

        // assumes the upper 3x3 of m is a pure rotation _mat (i.e, unscaled) 
        this._quat.setFromRotationMat(m);

    }

    setRotationFromQuaternion(q: Quat) {
        // 假定q已经正交化
        this._quat.copy(q);
    }

    /**
     * 在本地坐标旋转
     * @param axis  正交化的旋转轴
     * @param angle  旋转角度
     * @returns  
     */
    rotateOnAxis(axis: Vec3, angle: number) {
        _q1.setFromAxisAngle(axis, angle);
        this._quat.multiply(_q1);
        return this;

    }

    /**
     * 在世界坐标旋转 不旋转父节点
     * @param axis  正交化的旋转轴
     * @param angle  旋转角度
     * @returns  
     */
    rotateOnWorldAxis(axis: Vec3, angle: number) {

        _q1.setFromAxisAngle(axis, angle);

        this._quat.premultiply(_q1);

        return this;

    }

    rotateX(angle: any) {

        return this.rotateOnAxis(_xAxis, angle);

    }

    rotateY(angle: any) {

        return this.rotateOnAxis(_yAxis, angle);

    }

    rotateZ(angle: any) {

        return this.rotateOnAxis(_zAxis, angle);

    }

    translateOnAxis(axis: Vec3, distance: number) {

        // translate object by distance along axis in object space
        // axis is assumed to be normalized

        _v1.copy(axis).applyQuat(this._quat);
        this._position.add(_v1.multiplyScalar(distance));
        return this;

    }

    translateX(distance: number) {

        return this.translateOnAxis(_xAxis, distance);

    }

    translateY(distance: number) {

        return this.translateOnAxis(_yAxis, distance);

    }

    translateZ(distance: number) {

        return this.translateOnAxis(_zAxis, distance);

    }

    localToWorld(vector: { applyMat4: (arg0: Mat4) => any; }) {

        return vector.applyMat4(this._matWorld);

    }

    worldToLocal(vector: { applyMat4: (arg0: Mat4) => any; }) {

        return vector.applyMat4(_m1.copy(this._matWorld).invert());

    }

    lookAt(x: number | Vec3, y?: number, z?: number) {

        // This method does not support objects having non-uniformly-scaled parent(s)

        if (x instanceof Vec3) {
            _target.copy(x);
        } else if (y !== undefined && z !== undefined) {
            _target.set(x, y, z);
        }

        const parent = this.entity!.parent;
        this.updateWorldMat(true, false);
        _position.setFromMatPosition(this._matWorld);

        // if (this.isCamera || this.isLight) { 
        //     _m1.lookAt(_position, _target, this.up); 
        // } else { 
        _m1.lookAt(_target, _position, this.up);
        // }

        this._quat.setFromRotationMat(_m1);

        if (parent) {

            _m1.extractRotation((<MetaEntity>parent).transfrom._matWorld);
            _q1.setFromRotationMat(_m1);
            this._quat.premultiply(_q1.inverse());

        }

    } 
    update(entity: MetaEntity) {
    }

}


ComponentLibs.Instanced.add(TransformComponent); 