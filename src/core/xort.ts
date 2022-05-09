import { EventHandler } from "../of";
import { MetaVision } from './vision';
import { XortScene } from "./scene";
import { GeometricsMananger } from './manager/geometricsManager';
import { TextureManager } from './manager/texturemanager';
import { Timer } from '../of/core/timer';
import { AttributeManager } from './manager/attributeManager';
import { Statistics } from "./statistics";

export class Xort extends EventHandler {
    _vision: MetaVision;
    _scene: XortScene;
    defaultLoop: Function | any;
    private _timer: Timer = new Timer(true);

    textureManager: TextureManager;
    geometricManager: GeometricsMananger;
    attributeManager: AttributeManager;
    statistics: Statistics;
    sampleCount: number = 1;
    constructor(canvas: HTMLCanvasElement) {
        super();
        this._vision = new MetaVision(canvas, {});
        this._scene = new XortScene;

        this.statistics = new Statistics();
        this.geometricManager = new GeometricsMananger(this);
        this.textureManager = new TextureManager(this);
        this.attributeManager = new AttributeManager(this);

        this.defaultLoop = this.loop.bind(this)
    }

    loop() {
        this._timer.deltaElapsed;
        this._vision.render(this._scene);
        requestAnimationFrame(this.defaultLoop);
    }

    async init() {
        await this._vision.init();
    }

    get scene() {
        return this._scene;
    }

    set scene(val: XortScene) {
        this._scene = val;
    }

}