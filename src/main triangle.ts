const vCode = ` 
struct Output {
    @builtin(position) Position: vec4<f32>;
    @location(0) vColor: vec4<f32>;
}

@stage(vertex)
fn vs_main(@builtin(vertex_index) VertexIndex: u32) -> Output {
    var pos:array<vec2<f32>,3> = array<vec2<f32>,3> (
        vec2<f32>(0.0, 0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.5, -0.5)
    );

    var color:array<vec3<f32>,3> = array<vec3<f32>,3>(
        vec3<f32>(1.0, 0.0, 0.0),
        vec3<f32>(0.0, 1.0, 0.0),
        vec3<f32>(0.0, 0.0, 1.0)
    );

    var output:Output;
    output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    output.vColor = vec4<f32>(color[VertexIndex], 1.0);

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

const pipeline = device.createRenderPipeline({
    vertex: {
        module: device.createShaderModule({
            code: vCode
        }),
        entryPoint: 'vs_main'
    },
    fragment: {
        module: device.createShaderModule({
            code: vCode
        }),
        entryPoint: 'fs_main',
        targets: [{ format: 'rgba8unorm' }]
    },
    primitive: {
        topology: "triangle-list"
    }
})

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
    renderPass.draw(3, 1, 0, 0);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()])
}

createTriangle();