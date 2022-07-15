import { Component, ComponentSchema } from '../component';
import { Types } from '../../of/utils/types';
export class TransfromComponent extends Component {
    static schema: ComponentSchema = {
        projectionMat: { type: Types.Mat4 },
        normalMat: { type: Types.Mat3 }, 
    };
    constructor() {
        super();
    }


}
