import { MaterialData } from '../data/material';
import { XortEntity } from '../entity';
import { Xort } from '../xort';
import { BaseManager } from './baseManager';

export const DataType = {
    float: 'f32',
    int: 'i32',
    uint: 'u32',
    bool: 'bool',

    vec2: 'vec2<f32>',
    ivec2: 'vec2<i32>',
    uvec2: 'vec2<u32>',
    bvec2: 'vec2<bool>',

    vec3: 'vec3<f32>',
    ivec3: 'vec3<i32>',
    uvec3: 'vec3<u32>',
    bvec3: 'vec3<bool>',

    vec4: 'vec4<f32>',
    ivec4: 'vec4<i32>',
    uvec4: 'vec4<u32>',
    bvec4: 'vec4<bool>',

    mat3: 'mat3x3<f32>',
    imat3: 'mat3x3<i32>',
    umat3: 'mat3x3<u32>',
    bmat3: 'mat3x3<bool>',

    mat4: 'mat4x4<f32>',
    imat4: 'mat4x4<i32>',
    umat4: 'mat4x4<u32>',
    bmat4: 'mat4x4<bool>'
}
export class BindGroupManager extends BaseManager {

    constructor(xort: Xort) {
        super(xort);

    }

    acquire(entity: XortEntity): GPUBindGroup {
        const cache = this.get(entity);
        let currentBindGroup;
        if (this._needsUpdate(entity, cache)) {
            currentBindGroup = this.create(entity);
            this.add(entity, currentBindGroup);

            const pipeline: GPURenderPipeline = this.xort.renderpipelineManager.acquire(entity);
            const bindLayout = pipeline.getBindGroupLayout(0);

        } else {
            currentBindGroup = cache;
        }

        return currentBindGroup;
    }

    private _needsUpdate(_object: XortEntity, _cache: any) {
        return true;
    }


    create(entity: XortEntity) {
        const material: MaterialData = entity.material?._asset as any;
        const device = this.xort._vision.device;

        device.createBuffer({
            size: 292, //(16x4+9) x4
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        })
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,//transfrom uniform
                    visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
                    buffer: {}
                }, {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                }, {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                }
            ]
        })
        const unifromGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: buffer },
            }, {
                binding: 1,
                resource: texture
            }, {
                binding: 2,
                resource: sampler
            }]
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });
    }

    private _createTransfrom() {

    }
}