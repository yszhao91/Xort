import { Component, IDescriptor } from "../../of";
import { GeometryData } from '../data/geometry';

export class GeometryComponent extends Component<any> {
    declare _asset: GeometryData;
    constructor() {
        super();
        this.descriptors = [{ name: 'asset' }]
    }

    onChange(_descriptor?: IDescriptor, _value?: any): void {

    }

}
