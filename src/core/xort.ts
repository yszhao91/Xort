import { EventHandler } from "../of";
import { MetaVision } from './vision';
import { XortScene } from "./scene";
import { GeometricsMananger } from './manager/geometricsManager';
import { TextureManager } from './manager/texturemanager';
import { Timer } from '../of/core/timer';
import { AttributeManager } from './manager/attributeManager';
import { Statistics } from "./statistics";
import { RenderStatesManager } from "./manager/renderStatesManager";
import { RenderPipelineMananger } from "./manager/renderpipeManager";
import { BindGroupManager } from "./manager/bindGroupManager";


export class Xort extends EventHandler {
    _vision: MetaVision;
    _scene: XortScene;
    _timer: Timer = new Timer(true);

    defaultLoop: Function | any;

    textureManager: TextureManager;
    geometricManager: GeometricsMananger;
    attributeManager: AttributeManager;
    renderpipelineManager: RenderPipelineMananger;
    bindGroupManager: BindGroupManager;
    renderStateManager: RenderStatesManager;
    statistics: Statistics;
    sampleCount: number = 1;
    _currentRenderState: any;

    /**
     * 渲染物体是否要按距离排序
     */
    sortObjects: boolean = true;
    constructor(canvas: HTMLCanvasElement) {
        super();
        this._vision = new MetaVision(this, canvas, {});
        this._scene = new XortScene(this);

        this.statistics = new Statistics();
        this.geometricManager = new GeometricsMananger(this);
        this.textureManager = new TextureManager(this);
        this.attributeManager = new AttributeManager(this);
        this.renderpipelineManager = new RenderPipelineMananger(this);
        this.renderStateManager = new RenderStatesManager(this);
        this.bindGroupManager = new BindGroupManager(this);

        this.defaultLoop = this.loop.bind(this)
    }

    /**
     * 切换场景
     */
    switchScene(scene: XortScene) {
        this.scene = scene;
    }

    async start(loop: boolean = true) {
        await this._vision.init();

        if (loop)
            this.defaultLoop()
    }

    preHandle() {
        this.scene.nextStep(this);

        this._currentRenderState = this.renderStateManager.get(this.scene);
        this._currentRenderState.init();

        if (this.sortObjects === true) {
            
        }
    }

    loop() {
        this.preHandle();

        this._vision.render();

        requestAnimationFrame(this.defaultLoop);
    }

    get scene() {
        return this._scene;
    }

    set scene(val: XortScene) {
        this._scene = val;
    }

}