import { fragmentShader, vertexShader } from "./shader/mesh.example";

const vCode = ` 
struct Output {
    @builtin(position) Position: vec4<f32>,
    @location(0) vColor: vec4<f32>
}

@vertex
fn vs_main(@location(0) pos:vec4<f32>, @location(1) color:vec4<f32>) -> Output {  
    var output:Output; 
    output.Position = pos;
    output.vColor = color;
    return output;
}

@fragment
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
    format: 'rgba8unorm',
    size:{width:window.innerWidth,height:window.innerHeight}
})
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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


const vertexData = new Float32Array([
    -0.5, -0.5, 1, 0, 0,    // vertex a: red
    0.5, -0.5, 0, 1, 0,    // vertex b: green
    -0.5, 0.5, 1, 1, 0,    // vertex d: yellow
    -0.5, 0.5, 1, 1, 0,    // vertex d: yellow
    0.5, -0.5, 0, 1, 0,    // vertex b: green
    0.5, 0.5, 0, 0, 1     // vertex c: blue
]);


const pipeline = device.createRenderPipeline({
    vertex: {
        module: device.createShaderModule({
            code: vertexShader
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
                    shaderLocation: 2,
                    format: 'float32x3',
                    offset: 0
                }
                ]

            }
        ]
    },
    fragment: {
        module: device.createShaderModule({ 
            code: fragmentShader
        }),
        entryPoint: 'fs_main',
        targets: [{ format: 'rgba8unorm' }]
    },
    primitive: {
        topology: "triangle-list",
        // stripIndexFormat:'uint32',
    },
    layout:"auto"
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

 
const vbuffer = createGPUBuffer(device, vertexData) 

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
    // renderPass.setIndexBuffer(ibuffer,'uint32')
    renderPass.draw(6);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()])
}

createTriangle();