import { Component, IDescriptor } from "../../of";

export class Geometry extends Component<any> {
    declare position: Array<number>;
    declare normal: Array<number>;
    declare uvs: Array<Array<number>>;
    declare tangent?: Array<number>;

    constructor() {
        super();
        this.descriptors = [{ name: 'postion' }]
    }

    onChange(descriptor?: IDescriptor, value?: any): void {

    }

}
