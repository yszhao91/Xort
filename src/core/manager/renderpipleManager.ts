import { BaseManager } from './baseManager';
import { Xort } from '../xort';
import { XortEntity } from '../entity';
import { MaterialData } from '../data/material';
import { GeometryData } from '../data/geometry';
export class RenderPipelineMananger extends BaseManager {
    constructor(xort: Xort) {
        super(xort)
    }

    acquire(entity: XortEntity): GPURenderPipeline {
        const cache = this.get(entity);
        let currentPipeline;
        if (this._needsUpdate(entity, cache)) {
            currentPipeline = this.create(entity)
            this.add(entity, currentPipeline);
        } else {
            currentPipeline = cache;
        }

        return currentPipeline;
    }
    private _needsUpdate(_object: XortEntity, _cache: any) {
        return true;
    }


    create(entity: XortEntity) {
        const material: MaterialData = entity.material?._asset as any;
        const geometry: GeometryData = entity.geometry?._asset as any;
        const sampleCount = this.xort.sampleCount;

        const device = this.xort._vision.device;

        let cachePipeline = this.get(entity);
        if (cachePipeline === undefined) {
            const vertexBuffers: GPUVertexBufferLayout[] = [];
            for (const name in geometry.attributes) {
                const attribute = geometry.getAttribute(name);
                if (!attribute)
                    continue;
                const stepMode = attribute.isInstance ? 'instance' : 'vertex';

                vertexBuffers.push({
                    arrayStride: attribute.stride,
                    attributes: [{ shaderLocation: attribute.location, offset: attribute.offset, format: attribute.format }],
                    stepMode: stepMode
                });
            }

            const stageVertex: GPUVertexState = {
                module: device.createShaderModule({
                    code: material.vertexShaderCode,
                }),
                buffers: vertexBuffers,
                entryPoint: material.vertexEntryPoint,
            }

            const stageFragment: GPUFragmentState = {
                module: device.createShaderModule({ code: material.fragmentShaderCode }),
                entryPoint: material.fragmentEntryPoint,
                targets: [{
                    format: material.colorFormat,
                    blend: {
                        alpha: material.alphaBlend,
                        color: material.colorBlend
                    },
                    writeMask: material.colorWriteMask
                }]
            }

            const renderPipeline: GPURenderPipeline = device.createRenderPipeline({
                vertex: stageVertex,
                fragment: stageFragment,
                primitive: {
                    topology: material.topology,
                    frontFace: material.frontFace,
                    cullMode: material.cullMode,
                    // stripIndexFormat
                },
                multisample: {
                    count: sampleCount
                },
                // depthStencil: undefined,
                // label: undefined,
                layout: 'auto' as any,
            })
            this.add(entity, renderPipeline)
            cachePipeline = renderPipeline;
        }
        return cachePipeline;
    }

} 