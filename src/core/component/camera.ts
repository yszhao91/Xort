import { Mat4 } from "../../cga";
import { Component, IDescriptor } from "../../of";
import { XortEntity } from "../entity";
import { RADIANS_PER_DEGREE } from '../../cga/math/Math';

enum CameraType {
    Perspection = 0,
    Origition = 1
}

class CameraData {
    type: CameraType = CameraType.Perspection
    fov: number = 45;
    near: number = 0.1;
    far: number = 1000;
    aspect: number = 1;
    //
    width: number = 0;
    height: number = 0;
    left: number = 0;
    right: number = 0
    top = 0
    bottom = 0;
    zoom: number = 1;
}

export class CameraComponent extends Component<any> {
    declare _asset: CameraData;
    declare entity: XortEntity;
    _projectionMat: Mat4 = new Mat4();
    _projectionMatInverse: Mat4 = new Mat4(); 
    constructor() {
        super();
        this.descriptors = [{ name: 'asset' }];

        this.on('addToEntity', (entity: XortEntity) => {
            entity._compileCache.camera = this;
        });
    }

    onChange(_descriptor?: IDescriptor, _value?: any): void {

    }

    nextStep(_entity?: XortEntity): void {
        if (!this.needsUpdate)
            return;

        this.entity.transfrom;
        this.needsUpdate = true;

        this._projectionMatInverse.copy(this._projectionMat).invert();

        // object.modelViewMat.multiplyMats(camera._matWorldInverse, object.matrixWorld);
        // object.normalMatrix.getNormalMatrix(object.modelViewMatrix); 
        
        // 视图矩阵 = 相机的模型矩阵的逆
        // 法线矩阵 =  模型视图矩阵的逆
    }

    _updateProjectionMatrix() {
        const d = this._asset;
        const near = d.near;
        let top = near * Math.tan(RADIANS_PER_DEGREE * 0.5 * d.fov) / d.zoom;
        let height = 2 * top;
        let width = d.aspect * height;
        let left = -0.5 * width;
        // const view = this.view;

        // if (this.view !== null && this.view.enabled) {
        //     const fullWidth = view.fullWidth,
        //         fullHeight = view.fullHeight;
        //     left += view.offsetX * width / fullWidth;
        //     top -= view.offsetY * height / fullHeight;
        //     width *= view.width / fullWidth;
        //     height *= view.height / fullHeight;
        // }

        this._projectionMat.makePerspective(left, left + width, top, top - height, near, d.far);
        this._projectionMatInverse.copy(this._projectionMat).invert();
    }



}
