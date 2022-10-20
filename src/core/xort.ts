
import { MetaVision } from './vision';
import { XortScene } from "./scene";
import { GeometricsMananger } from './manager/geometricsManager';
import { TextureManager } from './manager/texturemanager';
import { AttributeManager } from './manager/attributeManager';
import { Statistics } from "./statistics";
import { RenderStatesManager } from "./manager/renderStatesManager";
import { RenderPipelineMananger } from "./manager/renderpipeManager";
import { BindGroupManager } from "./manager/bindGroupManager";
import { Timer } from 'object_frame';
 

export class Xort {
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
        this._vision = new MetaVision(this, canvas, {});
        this._scene = new XortScene(this);

        this.statistics = new Statistics();
        this.geometricManager = new GeometricsMananger(this);
        this.textureManager = new TextureManager(this);
        this.attributeManager = new AttributeManager(this);
        this.renderpipelineManager = new RenderPipelineMananger(this);
        this.renderStateManager = new RenderStatesManager(this);
        this.bindGroupManager = new BindGroupManager(this);
 
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
  

    get scene() {
        return this._scene;
    }

    set scene(val: XortScene) {
        this._scene = val;
    }

}