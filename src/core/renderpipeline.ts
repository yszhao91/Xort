import { Xort } from './xort';
import { XortEntity } from './entity';
export class RenderPipeline {
    pipeline?: GPUComputePipeline;
    constructor(private _xort: Xort, sampleCount: number) {

    }

    create(cacheKey, stageVertex, stageFragment, entity: XortEntity) {
        const material = entity.material;
        const geometry = entity.geometry;
        const device = this._xort._vision.device;
        const sampleCount = this._xort.sampleCount;


        this.stageVertex = stageVertex;
        this.pipeline = device.createComputePipeline({
            vertex: Object.assign({}, stageVertex.stage, { buffers: vertexBuffers }),
            fragment: Object.assign({}, stageFragment.stage, {
                targets: [{
                    format: colorFormat,
                    blend: {
                        alpha: alphaBlend,
                        color: colorBlend
                    },
                    writeMask: colorWriteMask
                }]
            }),
            primitive: {},
            depthStencil: {},
            multisample: {
                count: sampleCount
            }
        })
    }
}