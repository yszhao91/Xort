import { MaterialData } from '../data/material';
import { XortEntity } from '../entity';
import { Xort } from '../xort';
import { BaseManager } from './baseManager';
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