import { Color } from '@xort/cga';
import { Xort } from './xort';
import { XortEntity } from './entity';
import { IStringDictionary, Undefinable } from '@xort/of'; 
import { Entity } from 'object_frame';

export class XortScene extends Entity { 
    background: Color = new Color(0.5, 0.5, 0.6);
    depthTexture: Undefinable<GPUTexture>;
    depth: boolean = true;
    _items: IStringDictionary<XortEntity> = {};
    opaque: XortEntity[] = [];
    transparent: XortEntity[] = [];

    readonly isXortScene: boolean = true;
    constructor(xort: Xort) {
        super(xort)
 
    } 

}