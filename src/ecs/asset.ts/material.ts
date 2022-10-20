import { Component } from '../../of/core/component';
import { MaterialData } from '../data/material';


export class MaterialComponent extends Component<any>{
    declare _asset: MaterialData; 
    constructor() {
        super();
    }


}