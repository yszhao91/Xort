import { Xort } from '../xort';
import { BaseManager } from './baseManager';
import { BufferAttribute, GeometryData } from '../data/geometry';
import { isUndefNull } from '../../of/utils/types';

export class GeometricsMananger extends BaseManager {
    constructor(xort: Xort) {
        super(xort);
    }


    get(attribute: BufferAttribute) {
        this.update(attribute, attribute.name === 'index')
        return this._map.get(attribute);
    }

    remove(attribute: BufferAttribute) {
        const data = this._map.get(attribute);

        if (data) {
            data.buffer.destroy();
            this._map.delete(attribute);
        }
    }

    /**
     * 更新buffer 没有就创建
     * @param attribute 
     * @param isIndex 
     * @param usage 
     */
    update(attribute: BufferAttribute, isIndex: boolean = false, usage?: GPUBufferUsage) {
        let data = this._map.get(attribute);
        if (data === undefined) {
            if (isUndefNull(usage)) {
                usage = ((isIndex === true) ? GPUBufferUsage.INDEX : GPUBufferUsage.VERTEX) as any;
            }

            data = this._createBuffer(attribute, usage);
            this._map.set(attribute, data);
        } else if (usage && usage !== data.usage) {

            data.buffer.destroy();
            data = this._createBuffer(attribute, usage);
            this._map.set(attribute, data);

        } else if (data.version < attribute.version) {
            debugger
            this._writeBuffer(data.buffer, attribute);

            data.version = attribute.version;
        }
    }

    private _createBuffer(geometry: BufferAttribute, usage?: GPUBufferUsage) {
        const array = geometry.array;
        const device = this.xort._vision.device;
        const buffer = device.createBuffer({
            label: geometry.name,
            size: array.byteLength,
            usage: (usage as any) || GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });

        new (array as any).constructor(buffer.getMappedRange()).set(array);
        buffer.unmap();

        return {
            version: 0,
            buffer,
            usage: 0
        }
    }

    private _writeBuffer(buffer: GPUBuffer, attribute: BufferAttribute) {

        const array = attribute.array;
        const updateRange = attribute.updateRange;

        const device = this.xort._vision.device;
        if (updateRange.count === - 1) {
            // Not using update ranges 
            device.queue.writeBuffer(
                buffer,
                0,
                array,
                0
            );

        } else {
            device.queue.writeBuffer(
                buffer,
                0,
                array,
                updateRange.offset * array.BYTES_PER_ELEMENT,
                updateRange.count * array.BYTES_PER_ELEMENT
            );
            updateRange.count = - 1; // reset range

        }

    }

}