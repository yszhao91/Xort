import { Component, ComponentSchema } from "../../nof/component";
import { Types } from '../../of/utils/types';


export class CameraComponent extends Component<any> {

    static schema: ComponentSchema = {
        modelViewMat: { type: Types.Mat4 },
        projectionMat: { type: Types.Mat4 },
        projectionMatInverse: { type: Types.Mat4 },
    }

    constructor() {
        super();

    }


}
