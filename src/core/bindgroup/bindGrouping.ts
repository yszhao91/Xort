import { XortEntity } from '../entity';
export class BindGrouping {

    acquire(entity: XortEntity) {
        const transfromUniformBuffer = device.createBuffer({
            size: 4 * 4 * 16 + 4 * 9 + 1,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        return transfromUniformBuffer;
    }
    
}