import { EventHandler } from "../of";
import { MetaVision } from './vision';
import { XortScene } from "./scene";
import { GeometricsMananger } from './manager/geometricsManager';
import { TextureManager } from './manager/texturemanager';
import { Timer } from '../of/core/timer';
import { AttributeManager } from './manager/attributeManager';
import { Statistics } from "./statistics";
import { RenderObjectMananger, WebGPURenderList } from './manager/renderManager';
import { RenderStatesManager } from "./manager/renderStatesManager";

       
export class Xort extends EventHandler {
    _vision: MetaVision;
    _scene: XortScene;
    _timer: Timer = new Timer(true);

    defaultLoop: Function | any;

    textureManager: TextureManager;
    geometricManager: GeometricsMananger;
    attributeManager: AttributeManager;
    objectManager: RenderObjectMananger;
    renderStateManager: RenderStatesManager;
    statistics: Statistics;
    sampleCount: number = 1;
    private _currentRenderList!: WebGPURenderList;
    _currentRenderState: any;

    /**
     * 渲染物体是否要按距离排序
     */
    sortObjects: boolean = true;
    constructor(canvas: HTMLCanvasElement) {
        super();
       this._vision = new MetaVision(this, canvas, {});
        this._scene = new XortScene;

        this.statistics = new Statistics();
        this.geometricManager = new GeometricsMananger(this);
        this.textureManager = new TextureManager(this);
        this.attributeManager = new AttributeManager(this);
        this.objectManager = new RenderObjectMananger(this);
        this.renderStateManager = new RenderStatesManager(this);

        this.defaultLoop = this.loop.bind(this)
    }

    setviewPort(x, y, width, height, minDepth = 0, maxDepth = 1) {

    }

    renderHandle() {
        this.scene.nextStep(this);

        this._currentRenderList = this.objectManager.get(this.scene, camera);
        this._currentRenderList.init();

        this._currentRenderState = this.renderStateManager.get(this.scene);
        this._currentRenderState.init();


        this._currentRenderList.finish();

        if (this.sortObjects === true) {

        }
    }

    loop() {
        this.renderHandle();

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