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

const vertices = new Float32Array([
    -0.5, -0.5,  // vertex a
    0.5, -0.5,  // vertex b
    -0.5, 0.5,  // vertex d
    -0.5, 0.5,  // vertex d
    0.5, -0.5,  // vertex b
    0.5, 0.5,  // vertex c
]);
const colors = new Float32Array([
    1, 0, 0,    // vertex a: red
    0, 1, 0,    // vertex b: green
    1, 1, 0,    // vertex d: yellow
    1, 1, 0,    // vertex d: yellow
    0, 1, 0,    // vertex b: green
    0, 0, 1     // vertex c: blue
]);

const vertices1 = new Float32Array([
    -0.5, -0.5,  // vertex a
    0.5, -0.5,  // vertex b
    0.5, 0.5,  // vertex c
    -0.5, 0.5,  // vertex d 
]);
const colors1 = new Float32Array([
    1, 0, 0,    // vertex a: red
    0, 1, 0,    // vertex b: green
    0, 0, 1,     // vertex c: blue
    1, 1, 0    // vertex d: yellow 
]);

const indices = new Uint32Array([
    0, 1, 2,
    2, 1, 3
]);

const pipeline = device.createRenderPipeline({
    vertex: {
        module: device.createShaderModule({
            code: vCode
        }),
        entryPoint: 'vs_main',
        buffers: [
            {
                arrayStride: 8,
                attributes: [{
                    shaderLocation: 0,
                    format: 'float32x2',
                    offset: 0
                }]
            },
            {
                arrayStride: 12 ,
                attributes: [
                    {
                        shaderLocation: 1,
                        format: 'float32x3',
                        offset: 0
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
        // stripIndexFormat:'uint32',
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

function createGPUIBuffer(device: GPUDevice, data: Uint32Array, usageFlag: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST) {
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true
    });
    new Uint32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
}

const vbuffer = createGPUBuffer(device, vertices)
const cbuffer = createGPUBuffer(device, colors) 
const ibuffer = createGPUIBuffer(device, indices) 

function createTriangle() {
    const commandEncoder = device.createCommandEncoder();
    const textureView = context?.getCurrentTexture().createView();
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            clearValue: { r: 0.2, g: 0.7, b: 1.0, a: 1.0 },
            loadOp: 'clear',
            storeOp: 'store',
        }]
    });
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vbuffer);
    renderPass.setVertexBuffer(1, cbuffer);
    // renderPass.setIndexBuffer(ibuffer,'uint32')
    renderPass.draw(6);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()])
}

createTriangle();