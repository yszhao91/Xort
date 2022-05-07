import { GPUPrimitiveTopology } from './core/webgpu';

export class Context {
    static createBuffer(device: GPUDevice, arraybuffer: any | ArrayBuffer, usage: GPUBufferUsage) {
        const buffer = device.createBuffer({
            size: arraybuffer.byteLength,
            usage: usage as unknown as number,
            mappedAtCreation: true
        });
        new arraybuffer.constructor(buffer.getMappedRange()).set(arraybuffer);
        return buffer;
    }


    static createRenderPipeline(device: GPUDevice, vertexShader: string, fragmentShader: string, format: GPUTextureFormat) {
        const arrayStride: number = 10;
        const attributes: GPUVertexAttribute[] = [];
        const entryPoint: string = 'main';
        const topology: GPUPrimitiveTopology = GPUPrimitiveTopology.TriangleList as GPUPrimitiveTopology;
        const pipeline = device.createRenderPipeline({
            vertex: {
                module: device.createShaderModule({
                    code: vertexShader,
                }),
                entryPoint: entryPoint,
                buffers: [
                    {
                        /*
                        步进值，也就是每个顶点需要占用几个储存空间，单位是 byte。
                        如果我们是用 Float32Array 来储存顶点位置的，每个 32 位浮点数需要 4 个 byte； 
                        有颜色或者其他的attribute，就是累加*/
                        arrayStride: arrayStride,
                        attributes: [
                            {
                                // position
                                //对应顶点着色器中 (location = 0)
                                shaderLocation: 0,
                                //0代表从头开始，不设置位移，有时候可以将多个顶点写一个buffer,根据offset位移选择用于不同地方
                                offset: 0,
                                //2个32位浮点数,如果3个32位浮点数，就可以写float32x3
                                format: "float32x2",
                            }
                        ],
                    },
                ]
            },
            fragment: {
                module: device.createShaderModule({
                    code: fragmentShader,
                }),
                entryPoint: entryPoint,
                targets: [
                    {
                        format: format,
                    },
                ],
            },
            primitive: {
                topology: topology,
            }
        });

        return pipeline;
    }
}