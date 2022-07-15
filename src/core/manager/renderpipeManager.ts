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
        if (_cache)
            return false;
        return true;
    }

    private _generateShaderGeometryInput(geometry: GeometryData) {
        const locs = []
        for (const key in geometry.attributes) {
            const attr = geometry.attributes[key];
            if (attr.stride > 1)
                locs.push(`\t@location(${attr.location}) ${attr.name}: vec${attr.stride}<f32>,`);
            else
                locs.push(`\t@location(${attr.location}) ${attr.name}: vec${attr.stride}<f32>,`);

        }
        return `struct GeometryInput {\n${locs.join('\n')}  \n};`
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
                    arrayStride: attribute.stride * 4,
                    attributes: [{
                        shaderLocation: attribute.location,
                        offset: attribute.offset,
                        format: attribute.format
                    }],
                    stepMode: stepMode
                });
            }
            const packVertexShaderCode = material.vertexShaderCode.replace('#Place{GeometryInput}', this._generateShaderGeometryInput(geometry));
            console.log(packVertexShaderCode);

            const stageVertex: GPUVertexState = {
                module: device.createShaderModule({
                    code: packVertexShaderCode,
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
            // const bindGroupLayout = device.createBindGroupLayout({
            //     entries: [{
            //         binding: 0,
            //         visibility: GPUShaderStage.VERTEX,
            //         buffer: {}
            //     }]
            // });

            const renderPipeline: GPURenderPipeline = device.createRenderPipeline({
                // layout: device.createPipelineLayout({
                //     bindGroupLayouts: [bindGroupLayout]
                // }),
                vertex: stageVertex,
                fragment: stageFragment,
                primitive: {
                    topology: material.topology,
                    // frontFace: material.frontFace,
                    cullMode: 'none' //material.cullMode,
                    // stripIndexFormat
                },
                multisample: {
                    count: sampleCount
                },
                depthStencil: {
                    format: "depth24plus",
                    depthWriteEnabled: true,
                    depthCompare: "less"
                },
                // depthStencil: undefined,
                // label: undefined,
                layout: 'auto',
            })
            this.add(entity, renderPipeline)
            cachePipeline = renderPipeline; 
        }
        return cachePipeline;
    }

} 