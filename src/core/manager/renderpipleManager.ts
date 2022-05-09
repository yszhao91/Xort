import { RenderPipeline } from '../renderpipeline';
import { Xort } from '../xort';
import { BaseManager } from './baseManager';
export class RenderPipelineMananger extends BaseManager { 
    constructor(xort: Xort) {
        super(xort)
    }

    get(object: RenderPipeline) {
        const device = this.xort._vision.device;

    }

    _acquirePipeline() {
        let pipeline;

        if (!pipeline) {
            pipeline = new RenderPipeline(this.xort, this.xort.sampleCount)
            pipeline.create(cacheKey, stageVertex, stageFragment, object, nodeBuilder);

            pipelines.push(pipeline);
        }
    }
}