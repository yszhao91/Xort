import { EventHandler } from "../of";
import { MetaVision } from './vision';
import { XortScene } from "./scene";
import { GeometricsMananger } from './manager/geometricsManager';
import { TextureManager } from './manager/texturemanager';

export class Xort extends EventHandler {
    _vision: MetaVision;
    _scene: XortScene;
    geometricManager: GeometricsMananger;
    textureManager: TextureManager;
    constructor(canvas: HTMLCanvasElement) {
        super();
        this._vision = new MetaVision(canvas, {});
        this._scene = new XortScene;
        this.geometricManager = new GeometricsMananger(this);
        this.textureManager = new TextureManager(this);
    }

    async init() {
        await this._vision.init()
    }

    get scene() {
        return this._scene;
    }

    set scene(val: XortScene) {
        this._scene = val;
    }

}