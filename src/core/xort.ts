import { EventHandler } from "../of";
import { MetaVision } from './renderer';
import { Scene } from "./scene";

export class Xort extends EventHandler {
    _renderer: MetaVision;
    _scene: Scene;
    constructor(canvas: HTMLCanvasElement) {
        super();
        this._renderer = new MetaVision(canvas, {})
        this._scene = new Scene;
    }

    
    }



}