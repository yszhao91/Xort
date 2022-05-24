const vCode = ` 
struct Output {
    @builtin(position) Position: vec4<f32>,
    @location(0) vColor: vec4<f32>
}

@stage(vertex)
fn vs_main(@location(0) pos:vec4<f32>, @location(1) color:vec4<f32>) -> Output {  
    var output:Output; 
    output.Position = pos;
    output.vColor = color;
    return output;
}

@stage(fragment)
fn fs_main(@location(0) vColor:vec4<f32>)->@location(0) vec4<f32>{
    return vColor;
}
`
const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
const adpter = await navigator.gpu.requestAdapter() as GPUAdapter;
const device = await adpter.requestDevice() as GPUDevice;

const context = canvas.getContext('webgpu') as GPUCanvasContext;

context.configure({
    device: device,
    format: 'rgba8unorm'
})



const vertexData = new Float32Array([
    -0.5, -0.5, 1, 0, 0,    // vertex a: red
    0.5, -0.5, 0, 1, 0,    // vertex b: green
    0.5, 0.5, 0, 0, 1,     // vertex c: blue
    -0.5, 0.5, 1, 1, 0,    // vertex d: yellow 
]);


const indexData = new Uint16Array([0, 1, 2, 0, 2, 3]);


const pipeline = device.createRenderPipeline({
    vertex: {
        module: device.createShaderModule({
            code: vCode
        }),
        entryPoint: 'vs_main',
        buffers: [
            {
                arrayStride: 4 * (2 + 3),
                attributes: [{
                    shaderLocation: 0,
                    format: 'float32x2',
                    offset: 0
                },
                {
                    shaderLocation: 1,
                    format: 'float32x3',
                    offset: 8
                }
                ]
            }
        ]
    },
    fragment: {
        module: device.createShaderModule({
            code: vCode
        }),
        entryPoint: 'fs_main',
        targets: [{ format: 'rgba8unorm' }]
    },
    primitive: {
        topology: "triangle-list",
    }
})

function createGPUBuffer(device: GPUDevice, data: Float32Array, usageFlag: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST) {
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: usageFlag,
        mappedAtCreation: true
    });
    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
}


function createIGPUBuffer(device: GPUDevice, data: Uint16Array, usageFlag: GPUBufferUsageFlags = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST) {
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: usageFlag,
        mappedAtCreation: true
    });
    new Uint16Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
}


const vbuffer = createGPUBuffer(device, vertexData)
const ibuffer = createIGPUBuffer(device, indexData)

function createTriangle() {
    const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();
    const textureView = context?.getCurrentTexture().createView();
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            clearValue: [0.2, 0.7, 1.0, 1.0],
            loadOp: 'clear',
            storeOp: 'store',
        }],
        depthStencilAttachment: {
            view: textureView,

        }
    });
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vbuffer);
    renderPass.setIndexBuffer(ibuffer, 'uint16');
    // device.queue.writeBuffer 

    renderPass.drawIndexed(6);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()])
}

createTriangle();