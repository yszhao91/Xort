import { BaseManager } from './baseManager';
import { Xort } from '../xort';
import { XortScene } from '../scene';


class WebGPURenderState {

    constructor() {

        this.lightsNode = new LightsNode();

        this.lightsArray = [];

    }

    init() {

        this.lightsArray.length = 0;

    }

    pushLight(light) {

        this.lightsArray.push(light);

    }

    getLightNode() {

        return this.lightsNode.fromLights(this.lightsArray);

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