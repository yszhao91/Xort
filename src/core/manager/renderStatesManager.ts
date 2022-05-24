import { BaseManager } from './baseManager';
import { Xort } from '../xort';
import { XortScene } from '../scene';


class WebGPURenderState {

    constructor() {



    }

    init() {


    }

    pushLight(light: any) {


    }

    getLightNode() {


    }

}


export class RenderStatesManager extends BaseManager {
    constructor(xort: Xort) {
        super(xort);
    }

    get(scene: XortScene, camera?: any) {

        let renderState = super.get(scene);

        if (renderState === undefined) {

            renderState = new WebGPURenderState();
            super.add(scene, renderState);

        }

        return renderState;

    }

}