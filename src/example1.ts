
import { GeometryData } from './core/data/geometry';
import { fragmentShader, vertexShader } from './shader/mesh.example2';

const canvas: HTMLCanvasElement = document.getElementById('canvas') as any;

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter?.requestDevice()!;

const context = canvas.getContext('webgpu');
context?.configure({
    device: device,
    alphaMode: 'opaque',
    format: 'rgba8unorm',
    size: { width: window.innerWidth, height: window.innerHeight }
});

const geometry = GeometryData.cubeGeometry(2, 2, 2);

const vertexBuffer = device.createBuffer({
    size: geometry.getAttribute('position').array.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
});
new Float32Array(vertexBuffer.getMappedRange()).set(geometry.getAttribute('position').array);
vertexBuffer.unmap();

const normalBuffer = device.createBuffer({
    size: geometry.getAttribute('position').array.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
});
new Float32Array(normalBuffer.getMappedRange()).set(geometry.getAttribute('normal').array);
normalBuffer.unmap();

const uvBuffer = device.createBuffer({
    size: geometry.getAttribute('position').array.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
});
new Float32Array(uvBuffer.getMappedRange()).set(geometry.getAttribute('uv').array);
uvBuffer.unmap();

const indexBuffer = device.createBuffer({
    size: geometry.getIndex()!.array.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
});

const indexLen = geometry.getIndex()?.array.length!;
new Uint16Array(indexBuffer.getMappedRange()).set(geometry.getIndex()?.array!);
indexBuffer.unmap();


const renderpipeline = device.createRenderPipeline({
    vertex: {
        module: device.createShaderModule({
            code: vertexShader
        }),
        entryPoint: 'main',
        buffers: [{
            arrayStride: 12,
            attributes: [
                { shaderLocation: 0, offset: 0, format: 'float32x3' }
            ]
        },
        {
            arrayStride: 12,
            attributes: [{
                shaderLocation: 1, offset: 0, format: 'float32x3'
            }]
        },
        {
            arrayStride: 8,
            attributes: [{
                shaderLocation: 2, offset: 0, format: 'float32x2'
            }]
        }]
    },
    fragment: {
        module: device.createShaderModule({ code: fragmentShader }),
        entryPoint: 'main',
        targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
    },
    primitive: {
        topology: "triangle-list",
    },
    multisample: {
        count: 1
    },
    // depthStencil: {
    //     format: "depth24plus",
    //     depthWriteEnabled: true,
    //     depthCompare: "less"
    // },
    layout: 'auto' as any,
});


const depthTexture = device.createTexture({
    size: [window.innerWidth, window.innerHeight, 1],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT
});
depthTexture.createView({})

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function loop() {

    /**
     * 每一次绘制都要重新生成
     * createCommandEncoder
     * view
     * beginRenderPass
     */
    const commandEncoder = device.createCommandEncoder();
    const view = context?.getCurrentTexture().createView({format:'rgba8unorm'})!;
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view,
            clearValue: { r: 0, g: 0.5, b: 1, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
        }], 
        // depthStencilAttachment: {
        //     view: depthTexture.createView(),
        //     depthClearValue: 1.0,
        //     depthLoadOp: 'clear',
        //     depthStoreOp: "store",
        //     /*stencilClearValue: 0,
        //     stencilLoadOp: 'clear',
        //     stencilStoreOp: "store"*/
        // }
    });
    // renderPass.setViewport(0, 0, window.innerWidth, window.innerHeight, 0, 1);

    renderPass.setPipeline(renderpipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setVertexBuffer(1, normalBuffer);
    renderPass.setVertexBuffer(2, uvBuffer);
    renderPass.setIndexBuffer(indexBuffer, 'uint16');
    renderPass.drawIndexed(indexLen);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);


    requestAnimationFrame(loop);
}


loop();