import { Component, ComponentSchema, IUpdate } from '../component';
import { Types } from '../types';
import { ITimer } from '../utils/timer';
import { Asset } from '../asset';
import { ScriptAsset } from '../asset/script';

export enum ScriptType {
    Logic = 'log',
    Geometry = "geo",
    Control = "con",
    Common = "com",
}
export class ScriptComponent extends Component implements IUpdate {

    static schema: ComponentSchema = {
        scriptType: { type: Types.String },
        asset: { type: Types.Ref },//脚本内容 
    };
    declare asset: ScriptAsset;
    declare scriptType: ScriptType;

    constructor() {
        super();
    }



    update: (timer: ITimer) => {

    }


}
