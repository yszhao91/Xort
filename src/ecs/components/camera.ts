import { Mat4, RADIANS_PER_DEGREE } from "@xort/cga";
import { Component, ComponentSchema, Types } from "@xort/of";



export class CameraComponent extends Component {
    static label = "相机";
    modelViewMat: Mat4 = new Mat4();
    projectionMat: Mat4 = new Mat4();
    projectionMatInverse: Mat4 = new Mat4();

    declare cameratype: string;
    declare near: number;
    declare far: number;
    declare fov: number;
    declare zoom: number;
    declare aspect: number;

    static schema: ComponentSchema = {
        cameratype: {
            type: Types.Option, label: '类型',
            default: "Perspective",
            optionItems: [
                { name: "Perspective", label: "投影相机" },
                { name: "Orthographic", label: "正交相机" },
            ]
        },

        fov: { type: Types.Number, label: 'fov', default: 45 },
        near: { type: Types.Number, label: 'near', default: 0.1 },
        far: { type: Types.Number, label: 'far', default: 1000 },
        // aspect:{type:Types.Number,label:'aspect',default:1},
        zoom: { type: Types.Number, label: 'zoom', default: 1 },

        // width: number = 0;
        // height: number = 0;
        // left: number = 0;
        // right: number = 0
        // top = 0
        // bottom = 0; 
    };


    _updateProjectionMatrix() { 
        /**
         * 应该获取渲染dom，计算高宽
         */
        const near = this.near; 
        let top = near * Math.tan(RADIANS_PER_DEGREE * 0.5 * this.fov) / this.zoom;
        let height = 2 * top;
        let width = this.aspect * height;
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

        this.projectionMat.makePerspective(left, left + width, top, top - height, near, this.far);
        this.projectionMatInverse.copy(this.projectionMat).invert();
    }

}