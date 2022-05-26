import { BaseManager } from './baseManager';
import { Xort } from '../xort';
import { XortEntity } from '../entity';
import { MaterialData } from '../data/material';
export class RenderPipelineMananger extends BaseManager {
    constructor(xort: Xort) {
        super(xort)
    }

    acquire(entity: XortEntity): GPURenderPipeline {
        const device = this.xort._vision.device;

        const cache = this.get(entity);
        let currentPipeline;
        if (this._needsUpdate(entity, cache)) {
            const material: MaterialData = entity.material!._asset;

            const vertexStage: GPUVertexState = {
                module: device.createShaderModule({
                    code: material.vertexShaderCode,
                }),
                entryPoint: material.vertexEntryPoint,
            }
            const fragmentStage: GPUFragmentState = {
                module: device.createShaderModule({ code: material.fragmentShaderCode }),
                entryPoint: material.fragmentEntryPoint,
                targets: []
            }

            currentPipeline = this.create(vertexStage, fragmentStage, entity)
        } else {
            currentPipeline = cache;
        }

        return currentPipeline;
    }
    private _needsUpdate(_object: XortEntity, _cache: any) {
        return true;
    }


    create(stageVertex: GPUVertexState, stageFragment: GPUFragmentState, entity: XortEntity) {
        const material = entity.material?._asset;
        const geometry = entity.geometry?._asset;
        const sampleCount = this.xort.sampleCount;

        const device = this.xort._vision.device;

        let cachePipeline = this.get(entity);
        if (cachePipeline === undefined) {
            const vertexBuffers: GPUVertexBufferLayout[] = [];
            for (const name in geometry.attributes) {
                const attribute = geometry.getAttribute(name);
                if (!attribute)
                    continue;
                const stepMode = attribute.isInstanced ? 'instance' : 'vertex';

                vertexBuffers.push({
                    arrayStride: attribute.arrayStride,
                    attributes: [{ shaderLocation: attribute.slot, offset: attribute.offset, format: attribute.format }],
                    stepMode: stepMode
                });
            }

            const renderPipeline: GPURenderPipeline = device.createRenderPipeline({
                vertex: Object.assign({}, stageVertex, { buffers: vertexBuffers }),

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
            this.add(entity, renderPipeline)
            cachePipeline = renderPipeline;
        }
        return cachePipeline;
    }

} 