import { Component, IDescriptor } from "../../of"; 

export class GeometryComponent extends Component<any> { 
    constructor() {
        super();
        this.descriptors = [{ name: 'asset' }]
    }

    onChange(_descriptor?: IDescriptor, _value?: any): void {

    }

}
