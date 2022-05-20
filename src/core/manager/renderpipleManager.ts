import { BaseManager } from './baseManager';
import { Xort } from '../xort';
import { XortEntity } from '../entity';
export class RenderPipelineMananger extends BaseManager {
    constructor(xort: Xort) {
        super(xort)
    }


    create(cacheKey: any, stageVertex: GPUVertexState, stageFragment: GPUFragmentState, entity: XortEntity) {
        const material = entity.material;
        const geometry = entity.geometry;
        const sampleCount = this.xort.sampleCount;

        const cachePipeline = this.get(entity);
        if (cachePipeline === undefined) {
            const rednerPipeline = device.createRenderPipeline({
                vertex: Object.assign({}, stageVertex, { buffers: [] }),

                fragment: Object.assign({}, stageFragment, {
                    targets: [{
                        format: material.colorFormat,
                        blend: {
                            alpha: material.alphaBlend,
                            color: material.colorBlend
                        },
                        writeMask: material.colorWriteMask
                    }]
                }),
                primitive: {},
                multisample: {
                    count: sampleCount
                }
            })
            this.add(entity, rednerPipeline)
        }
    }
}
